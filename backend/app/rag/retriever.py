import os
import json
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

INDEXES_DIR = os.path.join(os.path.dirname(__file__), "indexes")
CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus")


class LegalRetriever:
    """
    Reasoning-based legal retriever. No vectors, no chunking.
    Uses LLM to reason through tree indexes and find relevant sections.
    """
    
    def __init__(self):
        self.indexes = {}
        self.corpus_texts = {}
        self.corpus_lines = {}
        self.available = False
        self._load_indexes()
        self._load_corpus()
    
    def _load_indexes(self):
        """Load all tree index JSON files into memory."""
        if not os.path.exists(INDEXES_DIR):
            logger.warning("Indexes directory not found")
            return
        
        for filename in os.listdir(INDEXES_DIR):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(INDEXES_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                key = filename.replace(".json", "")
                self.indexes[key] = data
            except Exception as e:
                logger.error(f"Failed to load index {filename}: {e}")
        
        if self.indexes:
            self.available = True
            print(f"[OK] Legal retriever loaded {len(self.indexes)} tree indexes")
        else:
            print("[FAIL] Legal retriever: no indexes found")
    
    def _load_corpus(self):
        """Load all corpus text files into memory for text extraction."""
        if not os.path.exists(CORPUS_DIR):
            return
        
        for filename in os.listdir(CORPUS_DIR):
            if not filename.endswith(".txt"):
                continue
            filepath = os.path.join(CORPUS_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                    lines = text.split("\n")
                key = filename.replace(".txt", "")
                self.corpus_texts[key] = text
                self.corpus_lines[key] = lines
            except Exception as e:
                logger.error(f"Failed to load corpus {filename}: {e}")
        
        print(f"[OK] Legal corpus loaded: {len(self.corpus_texts)} files")
    
    def is_available(self) -> bool:
        return self.available
    
    def get_all_indexes_summary(self) -> str:
        """
        Create a compact summary of ALL tree indexes to send to LLM 
        for reasoning-based retrieval.
        """
        summaries = []
        for key, index in self.indexes.items():
            act_name = index.get("act_name", key)
            chapters_summary = []
            for ch in index.get("chapters", []):
                title = ch.get("chapter_title", "")
                sections = ch.get("sections_range", "")
                keywords = ", ".join(ch.get("keywords", [])[:4])
                chapters_summary.append(
                    f"    - {title} (Sec {sections}) [Keywords: {keywords}]"
                )
            
            act_summary = f"  {act_name} ({key}):\n" + "\n".join(chapters_summary)
            summaries.append(act_summary)
        
        return "\n\n".join(summaries)
    
    def extract_sections(self, act_key: str, start_line: int, end_line: int, 
                         max_chars: int = 5000) -> str:
        """Extract actual text from corpus between line numbers."""
        if act_key not in self.corpus_lines:
            return f"[Text for {act_key} not available]"
        
        lines = self.corpus_lines[act_key]
        
        # Clamp line numbers
        start = max(0, start_line - 1)  # Convert to 0-indexed
        end = min(len(lines), end_line)
        
        extracted = "\n".join(lines[start:end])
        
        # Truncate if too long
        if len(extracted) > max_chars:
            extracted = extracted[:max_chars] + "\n...[truncated]"
        
        return extracted
    
    def find_chapter_by_sections(self, act_key: str, sections_hint: str) -> Optional[Dict]:
        """Find a chapter in the index by sections range hint."""
        if act_key not in self.indexes:
            return None
        
        for chapter in self.indexes[act_key].get("chapters", []):
            if sections_hint in chapter.get("sections_range", ""):
                return chapter
            # Also check section_titles
            for title in chapter.get("section_titles", []):
                if sections_hint in title:
                    return chapter
        return None
    
    async def retrieve(self, query: str, max_context_chars: int = 8000) -> str:
        """
        Main retrieval method. Uses LLM to reason through tree indexes 
        and find relevant legal sections.
        
        Returns: String of relevant legal text to inject into AI prompt.
        """
        if not self.available:
            return ""
        
        from app.services.llm_orchestrator import orchestrator
        
        # Build the retrieval prompt
        indexes_summary = self.get_all_indexes_summary()
        
        retrieval_prompt = f"""You are a legal research assistant. A user has a legal query.
Your job is to identify which specific chapters and sections from Indian law 
are RELEVANT to this query.

USER'S QUERY:
{query}

AVAILABLE LEGAL INDEXES:
{indexes_summary}

Based on the query, identify the MOST RELEVANT chapters/sections.
Return a JSON array (maximum 5 entries, most relevant first):

[
  {{
    "act_key": "<filename without extension, e.g. indian_contract_act_1872>",
    "chapter_title": "<exact chapter title from the index>",
    "sections_range": "<sections range from the index>",
    "relevance_reason": "<one line explaining why this is relevant>"
  }}
]

RULES:
1. Only include sections that are DIRECTLY relevant to the query
2. Maximum 5 entries — quality over quantity
3. act_key must exactly match the filenames listed above
4. Return ONLY valid JSON array, no markdown, no extra text"""

        try:
            # Ask LLM to reason through the indexes
            results = await orchestrator.generate_json(retrieval_prompt, task="classify")
            
            if not isinstance(results, list):
                results = [results] if isinstance(results, dict) else []
            
            # Extract actual text for each relevant section
            context_parts = []
            total_chars = 0
            
            for item in results[:5]:
                act_key = item.get("act_key", "")
                sections_range = item.get("sections_range", "")
                reason = item.get("relevance_reason", "")
                chapter_title = item.get("chapter_title", "")
                
                # Find the chapter in our index to get line numbers
                chapter = self.find_chapter_by_sections(act_key, sections_range)
                
                if chapter:
                    start_line = chapter.get("start_line", 0)
                    end_line = chapter.get("end_line", start_line + 100)
                    
                    # Calculate remaining space
                    remaining = max_context_chars - total_chars
                    if remaining <= 500:
                        break
                    
                    text = self.extract_sections(act_key, start_line, end_line, 
                                                  max_chars=min(3000, remaining))
                    
                    act_name = self.indexes.get(act_key, {}).get("act_name", act_key)
                    
                    section_header = (
                        f"--- {act_name} ---\n"
                        f"Chapter: {chapter_title}\n"
                        f"Sections: {sections_range}\n"
                        f"Relevance: {reason}\n\n"
                        f"{text}\n"
                    )
                    
                    context_parts.append(section_header)
                    total_chars += len(section_header)
                else:
                    # Fallback: if chapter not found in index, note it
                    act_name = self.indexes.get(act_key, {}).get("act_name", act_key)
                    context_parts.append(
                        f"--- {act_name} ---\n"
                        f"Relevant: {chapter_title}, Sections {sections_range}\n"
                        f"Reason: {reason}\n"
                        f"[Full text extraction unavailable]\n"
                    )
            
            if context_parts:
                return "\n\n".join(context_parts)
            else:
                return ""
            
        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
            return ""


# Singleton
legal_retriever = LegalRetriever()

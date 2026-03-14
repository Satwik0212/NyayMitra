import logging
import chromadb
from typing import List, Dict, Any
from app.services.llm_orchestrator import orchestrator

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self._initialized = False
        try:
            # Use in-memory client
            self.client = chromadb.Client()
            self.collection = self.client.get_or_create_collection(name="nyaymitra_knowledge")
            self._initialized = True
            
            # Pre-seed with some basic generic legal info if empty
            if self.collection.count() == 0:
                self._seed_initial_data()
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")

    def is_available(self) -> bool:
        return self._initialized

    def _seed_initial_data(self):
        """Seed some basic legal contexts so RAG works out of the box."""
        docs = [
            "The Consumer Protection Act, 2019 protects consumers from unfair trade practices. Consumers can file a complaint in Consumer Dispute Redressal Commissions.",
            "In India, a First Information Report (FIR) must be filed under Section 154 of the Criminal Procedure Code for cognizable offenses.",
            "The Information Technology Act, 2000 covers cyber crimes. Section 66 deals with computer related offenses.",
            "Under the Hindu Marriage Act, 1955, grounds for divorce include cruelty, adultery, and desertion.",
            "The Real Estate (Regulation and Development) Act, 2016 (RERA) aims to protect home-buyers and boost investments in the real estate industry.",
            "A legal notice is a formal written communication between the parties wherein the sender notifies the recipient about his intention of undertaking legal proceedings.",
            "Under the Right to Information (RTI) Act, 2005, any citizen of India may request information from a public authority, which is required to reply within 30 days."
        ]
        metadatas = [{"source": "basic_seed", "id": str(i)} for i in range(len(docs))]
        ids = [f"seed_{i}" for i in range(len(docs))]
        
        try:
            # Using Chroma's default embedding function for the seed data
            # to avoid async issues in the synchronous __init__
            self.collection.add(
                documents=docs,
                metadatas=metadatas,
                ids=ids
            )
            logger.info("Seeded RAG with dummy legal concepts.")
        except Exception as e:
            logger.warning(f"Could not seed dummy data: {e}")

    async def retrieve_context(self, query: str, k: int = 3) -> str:
        if not self.is_available():
            return "No specific legal context available (database offline)."
            
        try:
            # We use the orchestrator to fetch embeddings to ensure they match our system choices
            query_embedding = await orchestrator.get_embeddings([query])
            
            if not query_embedding or not query_embedding[0]:
                 # Fallback to direct query if embeddings fail
                 results = self.collection.query(
                     query_texts=[query],
                     n_results=k
                 )
            else:
                 results = self.collection.query(
                     query_embeddings=query_embedding,
                     n_results=k
                 )
            
            if not results["documents"] or len(results["documents"]) == 0 or not results["documents"][0]:
                return "No relevant context found."
                
            # Flatten the retrieved documents
            flat_docs = [doc for doc in results["documents"][0]]
            return "\n\n".join(flat_docs)
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return "Error retrieving legal context."

rag_service = RAGService()

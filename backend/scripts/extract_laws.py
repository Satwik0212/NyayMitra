import os
import re
import fitz  # PyMuPDF
from pathlib import Path

# Paths
SOURCE_DIR = r"C:\Users\hp\Documents\Laws"
TARGET_DIR = r"C:\Users\hp\Documents\Praytna\NyayMitra\backend\app\rag\corpus"

# Filename mapping patterns
MAP = [
    (r"BNS|Bharatiya.*Nyaya.*Sanhita", "bns_2023.txt"),
    (r"BNSS|Bharatiya.*Nagarik.*Suraksha", "bnss_2023.txt"),
    (r"Consumer.*Protection", "consumer_protection_act_2019.txt"),
    (r"Contract.*Act", "indian_contract_act_1872.txt"),
    (r"Transfer.*Property", "transfer_of_property_act_1882.txt"),
    (r"Industrial.*Disputes", "industrial_disputes_act_1947.txt"),
    (r"Domestic.*Violence|Protection.*Women", "domestic_violence_act_2005.txt"),
    (r"Motor.*Vehicles", "motor_vehicles_act_1988.txt"),
    (r"Limitation.*Act", "limitation_act_1963.txt"),
    (r"Right.*Information|RTI", "rti_act_2005.txt"),
]

def map_filename(original_name):
    for pattern, target in MAP:
        if re.search(pattern, original_name, re.IGNORECASE):
            return target
    # Default: lowercase with underscores
    clean_name = re.sub(r'[^a-zA-Z0-9]', '_', Path(original_name).stem).lower()
    return f"{clean_name}.txt"

def clean_text(text):
    # Remove excessive blank lines (keep max 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Optional: Basic heuristic for repeating headers/footers
    # (In a real legal extraction, we'd look for patterns like page numbers 
    # or "THE GAZETTE OF INDIA" at top/bottom, but let's keep it robust for now)
    
    return text.strip()

def process_pdfs():
    os.makedirs(TARGET_DIR, exist_ok=True)
    pdf_files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith('.pdf')]
    
    print(f"Found {len(pdf_files)} PDF files in {SOURCE_DIR}\n")
    print(f"{'Source File':<50} | {'Target File':<35} | {'Pages':<5} | {'Chars':<8} | {'Status'}")
    print("-" * 120)
    
    for pdf_name in pdf_files:
        source_path = os.path.join(SOURCE_DIR, pdf_name)
        target_filename = map_filename(pdf_name)
        target_path = os.path.join(TARGET_DIR, target_filename)
        
        try:
            doc = fitz.open(source_path)
            full_text = ""
            
            for page in doc:
                full_text += page.get_text() + "\n"
            
            cleaned_text = clean_text(full_text)
            char_count = len(cleaned_text)
            page_count = len(doc)
            
            status = "OK"
            if char_count < 500:
                status = "Flag: Possibly Scanned (Needs OCR)"
            
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(cleaned_text)
            
            preview = cleaned_text[:100].replace('\n', ' ') + "..."
            print(f"{pdf_name[:50]:<50} | {target_filename:<35} | {page_count:<5} | {char_count:<8} | {status}")
            print(f"  Preview: {preview}\n")
            
            doc.close()
            
        except Exception as e:
            print(f"Error processing {pdf_name}: {e}")

if __name__ == "__main__":
    process_pdfs()

import re

def detect_contract_context(text: str) -> bool:
    text_lower = text.lower()
    
    contract_keywords = [
        "contract", "agreement", "party", "parties", "sign", "signature", "terms", "conditions",
        "breach", "liability", "obligation", "indemnity", "clause", "warranty", "consideration",
        "अनुबंध", "समझौता", "पार्टी", "पक्ष", "हस्ताक्षर", "नियम", "शर्तें", "उल्लंघन", "दायित्व"
    ]
    
    # Check if multiple contract keywords appear to confirm context
    matches = sum(1 for keyword in contract_keywords if keyword in text_lower)
    
    # Require at least 2 relevant words to classify as a contract scenario
    return matches >= 2

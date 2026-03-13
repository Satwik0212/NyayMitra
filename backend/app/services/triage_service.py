import re

def quick_triage(text: str) -> dict:
    text_lower = text.lower()
    
    critical_keywords = [
        "violence", "murder", "assault", "rape", "arrest", "police", "jail", "kidnap", "suicide", "abuse",
        "मारपीट", "धमकी", "हिंसा", "बलात्कार"
    ]
    
    urgent_keywords = [
        "eviction", "notice", "deadline", "salary not paid", "termination", "बेदखली", "नोटिस", "वेतन नहीं"
    ]
    
    helplines = {
        "Police 100": "100",
        "Women 181": "181",
        "Childline 1098": "1098",
        "Cyber Crime 1930": "1930",
        "NALSA Legal Aid 15100": "15100",
        "Senior Citizen 14567": "14567",
        "Emergency 112": "112"
    }
    
    is_critical = any(keyword in text_lower for keyword in critical_keywords)
    is_urgent = any(keyword in text_lower for keyword in urgent_keywords)
    
    if is_critical:
        return {
            "urgency_level": "emergency",
            "emergency_helplines": helplines,
            "suggested_action": "Contact emergency services immediately if you are in physical danger."
        }
    elif is_urgent:
        return {
            "urgency_level": "urgent",
            "emergency_helplines": {},
            "suggested_action": "Seek timely legal advice. Note any impending deadlines."
        }
    else:
        return {
            "urgency_level": "normal",
            "emergency_helplines": {},
            "suggested_action": "Proceed with analyzing your legal rights and standard procedures."
        }

from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Set seed for deterministic language detection
DetectorFactory.seed = 0

SUPPORTED_LANGUAGES = ["en", "hi", "ta", "te", "bn", "mr", "kn", "gu", "ml", "pa"]

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi",
    "kn": "Kannada",
    "gu": "Gujarati",
    "ml": "Malayalam",
    "pa": "Punjabi"
}

def detect_language(text: str) -> str:
    try:
        lang = detect(text)
        if lang in SUPPORTED_LANGUAGES:
            return lang
    except LangDetectException:
        pass
    return "en"

def get_response_language_instruction(lang_code: str) -> str:
    lang_name = LANGUAGE_NAMES.get(lang_code, "English")
    return f"Please provide the response in {lang_name}."

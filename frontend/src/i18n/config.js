import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app_name: 'NyayMitra',
      tagline: 'AI-Powered Legal Assistance for Every Citizen',
      analyze: 'Analyze Dispute',
      chat: 'Legal Chat',
      documents: 'Documents',
      process: 'Process Navigator',
      history: 'History',
      updates: 'Legal Updates',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up',
      guest_mode: 'Continue as Guest',
      analyze_your_dispute: 'Analyze Your Legal Dispute',
      describe_dispute: 'Describe your legal dispute in detail...',
      voice_input: 'Voice Input',
      analyzing: 'Analyzing...',
      results: 'Analysis Results',
      applicable_laws: 'Applicable Laws',
      your_rights: 'Your Rights',
      recommended_actions: 'Recommended Actions',
      urgency: 'Urgency Level',
      domain: 'Legal Domain',
      disclaimer: 'NyayMitra provides general legal information and is not a substitute for professional legal advice.',
      generate_document: 'Generate Document',
      legal_notice: 'Legal Notice',
      consumer_complaint: 'Consumer Complaint',
      fir_draft: 'FIR Draft',
      rti_application: 'RTI Application',
      download_pdf: 'Download PDF',
      log_blockchain: 'Log to Blockchain',
      verify_tx: 'Verify Transaction',
    }
  },
  hi: {
    translation: {
      app_name: 'न्यायमित्र',
      tagline: 'हर नागरिक के लिए AI-संचालित कानूनी सहायता',
      analyze: 'विवाद विश्लेषण',
      chat: 'कानूनी चैट',
      documents: 'दस्तावेज़',
      process: 'प्रक्रिया नेविगेटर',
      history: 'इतिहास',
      updates: 'कानूनी अपडेट',
      profile: 'प्रोफ़ाइल',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      signup: 'साइन अप',
      guest_mode: 'अतिथि के रूप में जारी रखें',
      analyze_your_dispute: 'अपने कानूनी विवाद का विश्लेषण करें',
      describe_dispute: 'अपने कानूनी विवाद का विस्तार से वर्णन करें...',
      voice_input: 'आवाज़ इनपुट',
      analyzing: 'विश्लेषण हो रहा है...',
      disclaimer: 'न्यायमित्र सामान्य कानूनी जानकारी प्रदान करता है और पेशेवर कानूनी सलाह का विकल्प नहीं है।',
    }
  },
  ta: { translation: { app_name: 'நீதிமித்ரா', tagline: 'ஒவ்வொரு குடிமகனுக்கும் AI-இயக்கப்பட்ட சட்ட உதவி' } },
  te: { translation: { app_name: 'న్యాయమిత్ర', tagline: 'ప్రతి పౌరుడికి AI-ఆధారిత న్యాయ సహాయం' } },
  bn: { translation: { app_name: 'ন্যায়মিত্র', tagline: 'প্রতিটি নাগরিকের জন্য AI-চালিত আইনি সহায়তা' } },
  mr: { translation: { app_name: 'न्यायमित्र', tagline: 'प्रत्येक नागरिकासाठी AI-चालित कायदेशीर सहाय्य' } },
  kn: { translation: { app_name: 'ನ್ಯಾಯಮಿತ್ರ', tagline: 'ಪ್ರತಿ ನಾಗರಿಕರಿಗೆ AI-ಚಾಲಿತ ಕಾನೂನು ಸಹಾಯ' } },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

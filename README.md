# 🏛️ NyayMitra — न्यायमित्र


**"Friend of Justice"**

> Your AI Legal Advocate — Instant Rights, Real Guidance

NyayMitra is an AI-powered legal assistance platform for Indian citizens. It analyzes legal disputes, identifies applicable laws and rights, provides actionable guidance, and creates tamper-proof evidence records on blockchain.

## 🔥 Features

- **AI Dispute Analysis** — Describe your legal situation in any Indian language, get comprehensive legal analysis with applicable laws, rights, and step-by-step actions
- **Interactive Legal Chat** — RAG-grounded legal Q&A with citations to Indian Acts and Sections
- **Legal Document Generator** — Auto-generate legal notices, consumer complaints, RTI applications, FIR helper text
- **Dual-Party Analysis** — See both sides of the dispute with strength scoring and mediation suggestions
- **Evidence Blockchain Proof** — Upload evidence files, store on IPFS, log tamper-proof hash on Polygon blockchain
- **Urgency Triage** — Auto-detect emergencies (violence, threats) and show helpline numbers
- **Process Navigator** — Step-by-step legal process guides (Consumer Forum, Rent Tribunal, FIR, RTI)
- **Multi-Language Support** — Works in Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, and English
- **Case Precedents** — Matching landmark cases relevant to your dispute
- **Legislative Updates** — Latest changes in Indian law (BNS, BNSS, new labor codes)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python 3.11 |
| AI/LLM | Multi-model orchestrator (Groq Llama 3.3 70B, Gemini 2.0 Flash, SarvamAI) |
| Embeddings | HuggingFace all-MiniLM-L6-v2 |
| Vector DB | ChromaDB |
| Blockchain | Polygon Amoy Testnet (Solidity smart contract) |
| Storage | IPFS via Pinata |
| Auth & DB | Firebase Auth + Firestore |
| Frontend | React + Vite + TailwindCSS (coming soon) |

## 📁 Project Structure
nyaymitra/
├── backend/
│ ├── app/
│ │ ├── main.py # FastAPI app entry point
│ │ ├── config.py # App configuration
│ │ ├── routers/ # API endpoints
│ │ │ ├── analyze.py # Dispute analysis
│ │ │ ├── chat.py # Legal chat + streaming
│ │ │ ├── documents.py # Document generation
│ │ │ ├── blockchain.py # Blockchain + evidence
│ │ │ ├── auth.py # Authentication
│ │ │ ├── process.py # Legal process flows
│ │ │ ├── precedents.py # Case precedents
│ │ │ ├── updates.py # Legislative updates
│ │ │ └── history.py # User history
│ │ ├── services/ # Business logic
│ │ │ ├── llm_orchestrator.py # Multi-model AI router
│ │ │ ├── blockchain_service.py
│ │ │ ├── evidence_service.py
│ │ │ ├── firebase_service.py
│ │ │ ├── language_service.py
│ │ │ ├── triage_service.py
│ │ │ ├── contract_detector.py
│ │ │ ├── document_service.py
│ │ │ └── providers/ # LLM provider implementations
│ │ ├── prompts/ # AI prompt templates
│ │ ├── models/ # Pydantic schemas
│ │ ├── data/ # Static legal data
│ │ └── templates/ # Document HTML templates
│ ├── .env.example
│ └── requirements.txt
└── frontend/ # Coming soon

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- API keys: Groq, Gemini, Pinata, Firebase service account

### Setup

```bash
# Clone
git clone https://github.com/your-username/NyayMitra.git
cd NyayMitra/backend

# Virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Add Firebase service account
# Place your service-account.json in backend/

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health check |
| POST | /api/v1/analyze | Analyze legal dispute |
| POST | /api/v1/chat | Legal chat |
| POST | /api/v1/chat/stream | Streaming legal chat (SSE) |
| POST | /api/v1/generate-document | Generate legal document |
| POST | /api/v1/blockchain/log | Log hash on blockchain |
| POST | /api/v1/blockchain/evidence | Upload evidence to IPFS + blockchain |
| GET | /api/v1/blockchain/verify/{tx} | Verify blockchain record |
| GET | /api/v1/blockchain/wallet-balance | Check wallet balance |
| GET | /api/v1/process-flow/{type} | Legal process guides |
| GET | /api/v1/precedents/{domain} | Landmark case precedents |
| GET | /api/v1/updates | Legislative updates |
| POST | /api/v1/auth/login | User login |
| GET | /api/v1/history | User analysis history |

⚖️ **Legal Disclaimer**
NyayMitra provides legal information, NOT legal advice. This tool is for educational and informational purposes only. Always consult a qualified advocate before taking any legal action.

📄 **License**
MIT License — © 2025

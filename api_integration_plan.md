# API Integration Plan

## 1. Project Connection Overview
The NyayMitra platform utilizes a decoupled decoupled client-server architecture where the frontend (React/Vite) communicates with the backend (FastAPI) via standard HTTP REST APIs. 

Data flows asynchronously starting from user interactions on the React UI, formatting into JSON payloads via Axios service functions, and arriving at the FastAPI HTTP routers. The backend processes the request via its service layer (connecting to AI, Smart Contracts, or Firebase), formats a JSON response matching predefined Pydantic schemas, and returns it to the client. The React client then resolves the promise and updates its UI state.

*Authentication mechanism:* Firebase Auth provides an ID Token on the frontend. This JWT token is attached to the `Authorization: Bearer <token>` header of every outgoing Axios request. The backend intercepts this header, verifies the token's cryptographic signature via the Firebase Admin SDK, and retrieves the authenticated user's context.

## 2. Current Project Analysis

**Frontend Implementation Status:**
- The frontend has successfully implemented individual pages (Analyze, Chat, Documents, Home, Verify) complete with routing (`App.jsx`), global state (`AuthContext`, `AnalysisContext`), and polished Tailwind CSS UI components.
- The service layer (`frontend/src/services/api.js`, `analyzeService.js`, `chatService.js`, etc.) is fully structured with API intercepts that append the authentication token. It successfully connects to `http://localhost:5173/`.

**Backend Implementation Status:**
- The backend FastAPI application is fully built out with clear router separation (`analyze.py`, `chat.py`, `documents.py`, `auth.py`, `history.py`, `blockchain.py`, `lawyers.py`).
- Pydantic schemas tightly govern the expected inputs and outputs.
- Integration services (`llm_orchestrator`, `blockchain_service`, `lawyer_service`) are physically present and wired to the routers.

**Missing Connections / Mocked Data:**
- While the HTTP infrastructure exists, some backend services contain placeholder/mock logic:
  - **RAG Context:** In `analyze.py` and `chat.py`, the `rag_context` variable is currently an empty string or explicitly marked `TODO: Replace with rag_service.retrieve_context()`. The RAG pipeline relies on `rag_service.py` and `embedding_service.py` which are present but seem to be bypassed currently in the endpoints.
  - **Blockchain Signatures:** Requires actual contract deployment and EVM private keys loaded in `.env` to actually log hashes on Polygon instead of just simulating the return.
  - **Firebase Setup:** The frontend Firebase SDK initialization and the backend Firebase Admin SDK `service-account.json` need active Firebase project credentials.

## 3. Feature-to-API Mapping

| Feature | Frontend Page | Backend API Router | Status |
|---------|--------------|-------------------|--------|
| **User Authentication** | `src/pages/LoginPage.jsx` & `src/context/AuthContext.jsx` | `app/routers/auth.py` | Partially Implemented (Requires Firebase config credentials to work end-to-end) |
| **AI Dispute Analysis** | `src/pages/AnalyzePage.jsx` | `app/routers/analyze.py` | Connected (AI works, but RAG context injection is mocked) |
| **Legal Chat (RAG)** | `src/pages/ChatPage.jsx` | `app/routers/chat.py` | Connected (Streaming text works, but RAG context injection is mocked) |
| **Document Generation** | `src/pages/DocumentsPage.jsx` | `app/routers/documents.py` | Fully Connected & Operational |
| **Blockchain Evidence** | `src/pages/VerifyPage.jsx` | `app/routers/blockchain.py` | Partially Implemented (Requires Polygon wallet credentials and pinata keys) |
| **User History** | `src/pages/ProfilePage.jsx` | `app/routers/history.py` | Connected |
| **Lawyer Marketplace** | `src/pages/LawyerMarketplacePage.jsx` | `app/routers/lawyers.py` | Connected (Uses Mock data until Firestore credentials provided) |

## 4. Required API Endpoints
All predefined endpoints are currently existing in the FastAPI backend:

- **`POST /api/v1/analyze`**: Analyzes a dispute string. Receives `{text: string, language: string}`. Returns complex JSON categorization (urgency, domain, laws, actions).
- **`POST /api/v1/chat`**: Standard stateless chat request. Receives `{message: string, history: array}`.
- **`POST /api/v1/chat/stream`**: Server-Sent Events (SSE) streaming API for real-time typing effect.
- `POST /api/v1/generate-document`: Generates a legal template using AI or fallback Jinja. Receives `{doc_type: string, parameters: object}`.
- `POST /api/v1/auth/login`: Takes a Firebase issued `id_token`, verifies it, logs the user in Firestore, and returns user profile data.
- `GET /api/v1/history`: Fetches past AI analyses saved in Firestore for the currently authenticated User ID.
- `POST /api/v1/blockchain/log`: Takes evidence data, uploads to IPFS, and logs a hash on the blockchain.
- `GET /api/v1/lawyers`: Returns a filtered list of registered lawyers on the platform.
- `POST /api/v1/lawyers/connect-lawyer`: Allows an authenticated user to submit a consultation request.

## 5. Frontend Integration Plan

The frontend integration architecture is already properly established in the `frontend/src/services/` directory.

- **Centralized Axios Client (`api.js`)**: All requests use this configured Axios instance. It guarantees `http://localhost:8000` is targeted and attaches a request interceptor to automatically extract `localStorage.getItem('nyaymitra_token')` and append it to the Auth headers.
- **Service Modules (`analyzeService.js`, `chatService.js`, etc.)**: Provide clean Javascript wrapper functions (e.g., `analyzeDispute(text)`) so React components don't see raw URLs or HTTP methods.
- **Event Streams (`chatService.js`)**: Uses native browser `fetch()` and `TextDecoder` to cleanly process Server-Sent Events for word-by-word AI streams.

## 6. Data Flow Architecture

Example of data flow for the **Analyze Dispute** feature:

1. **User**: Types "My landlord kicked me out without notice" in `AnalyzePage.jsx` and clicks submit.
2. **Frontend UI**: React state captures the text. `AnalyzePage.jsx` calls `analyzeDispute(text)` from `analyzeService.js`.
3. **API Request**: `api.js` Axios client intercepts request, adds the Firebase Bearer token, and executes `POST /api/v1/analyze`.
4. **Backend Router**: FastAPI's `analyze.py` receives the JSON, validates it against the `DisputeRequest` Pydantic model, and verifies the Bearer token via `firebase_service.py`.
5. **Service Logic**: 
    - `triage_service` scans for violence/urgency.
    - `contract_detector` scans for contract keywords.
    - `llm_orchestrator` reaches out to the external Groq/Gemini API to execute inference.
6. **Database Logging**: The result is asynchronously saved to Firebase Firestore via `firebase_service.py` linked to the user's UID.
7. **Response**: FastAPI returns a JSON payload matching `DisputeResponse`.
8. **Frontend Display**: Axios resolves the promise, `AnalyzePage.jsx` saves the data in `AnalysisContext`, and navigates the user to `ResultsPage.jsx` to render the data.

## 7. Missing Components / What Still Needs To Be Built

While the code skeletons are complete, the following system-level integrations are missing to make it fully 100% operational in a real-world scenario:

1. **Firebase Authentication Configuration**: 
    - Frontend needs `firebase.js` initialized with valid web API keys.
    - Backend needs `service-account.json` placed in the `backend/` root to verify tokens and write to Firestore.
2. **Retrieval-Augmented Generation (RAG) Hookup**:
    - The code inside `analyze.py` and `chat.py` mocks the `rag_context` variable. It needs to actively call `rag_service.retrieve_context(text)` to pull actual legal embeddings from ChromaDB.
3. **External API Keys Setup**:
    - Complete population of the `.env` file (`GROQ_API_KEY`, `GEMINI_API_KEY`, `PINATA_API_KEY`, `POLYGON_PRIVATE_KEY`).
4. **Blockchain Smart Contract**:
    - A solidity contract actually needs to be deployed to the Polygon Amoy testnet, and its address mapped in the `.env` file under `CONTRACT_ADDRESS`.

## 8. Step-by-Step Implementation Plan

To make the system fully functional, execute these steps sequentially:

- **Step 1 — Environment Configuration**
  Populate the `backend/.env` file with real API keys (Groq/Gemini). Ensure backend runs successfully via `python -m uvicorn app.main:app`. Check `http://localhost:8000/docs`.
- **Step 2 — Firebase Integration**
  Set up a Firebase project. Add the web credentials to `frontend/.env` and drop the admin `service-account.json` into the python backend directory.
- **Step 3 — RAG Pipeline Activation**
  Remove the TODOs in `analyze.py` and `chat.py`. Map the empty `rag_context` variable to actively querying the `rag_service.py` to ensure AI responses are legally grounded.
- **Step 4 — Blockchain Deployment**
  Deploy the basic hashing smart contract to Polygon Amoy. Set the resulting `CONTRACT_ADDRESS` and your wallet private key in the backend `.env`.
- **Step 5 — End-to-End Testing Workflow**
  Boot both React and FastAPI. Register an account, log in, submit a test analysis ("My tenant won't pay rent"), generate a legal notice, chat with the AI about it, and upload evidence to trigger the blockchain flow.

## 9. Final System Architecture Summary

Once fully integrated, **NyayMitra** operates as a robust multi-tiered Web3/AI application. A citizen interacts with a high-speed React interface to explain their legal problem. The FastAPI backend securely verifies their identity using Firebase, then asynchronously processes their dispute. It uses ChromaDB to gather relevant Indian law context (RAG) and passes it to advanced LLMs (Groq/Gemini) to generate actionable legal advice and document drafts. Simultaneously, evidence provided by the user is uploaded to decentralized IPFS storage with its cryptographic fingerprint permanently burned onto the Polygon blockchain, ensuring total legal immutability of the evidence.

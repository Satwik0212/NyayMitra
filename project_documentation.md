# NyayMitra Project Documentation

---

## 1. Project Overview

NyayMitra ("Friend of Justice") is an AI-powered legal assistance platform designed for Indian citizens. It provides accessible legal guidance by analyzing legal disputes, identifying applicable laws and rights, and suggesting actionable steps.

The project features:

- Multilingual support
- Interactive legal Q&A grounded in Indian Acts (RAG)
- Automated document generation (e.g., RTI applications, FIRs)
- Tamper-proof evidence logging using blockchain technology
- Lawyer Marketplace to connect users with legal professionals

---

## 2. Project Architecture

The NyayMitra platform follows a modern, decoupled client-server architecture.

### Frontend Layer
A single-page application built with **React, Vite, and Tailwind CSS**.  
Handles user interactions, data visualization, and routing.

### Backend API Layer
A high-performance Python backend built with **FastAPI**, exposing RESTful endpoints for the frontend.

### AI / LLM Layer
A multi-model AI orchestrator that routes requests to models like **Groq Llama 3 / Gemini**, augmented by a **Retrieval-Augmented Generation (RAG)** system using **ChromaDB vector database** and **HuggingFace embeddings**.

### Blockchain / Storage Layer
Uses **Pinata** to upload file evidence to **IPFS**, and logs tamper-proof cryptographic hashes on the **Polygon Amoy blockchain** via smart contracts.

### Database & Identity
Uses **Firebase** for scalable user authentication, session management, and storing user history via **Firestore**.

---

## 3. Folder Structure Explanation

### Root Directory

| Folder/File | Purpose |
|-------------|--------|
| `backend/` | Contains the Python FastAPI server and AI/blockchain integration logic |
| `frontend/` | Contains the React application, styling, and UI components |
| `README.md` | The standard high-level introduction to the repository |

---

## Backend Structure (`backend/app/`)

### `routers/`
**Purpose:** Defines and maps all FastAPI HTTP endpoints (routes)

**Key Files**
- `analyze.py`
- `chat.py`
- `blockchain.py`
- `auth.py`
- `documents.py`
- `lawyers.py`

---

### `services/`
**Purpose:** Implements the core business logic, decoupled from HTTP routing

**Key Files**

- `llm_orchestrator.py` — AI routing
- `blockchain_service.py` — smart contract interaction
- `firebase_service.py` — database and authentication operations
- `evidence_service.py`

---

### `models/`
**Purpose:** Pydantic schemas for request validation, strict typing, and API response shaping

**Key Files**

- `schemas.py`
- `auth_schemas.py`
- `lawyer_schemas.py`

---

### `prompts/`
**Purpose:** Stores system instructions and prompt templates for the LLMs

---

### `templates/`
**Purpose:** HTML templates used by the backend to quickly generate standard legal documents

---

### `rag/` and `data/`
**Purpose:** Contains the Retrieval-Augmented Generation pipeline resources and static legal datasets for grounding the AI's responses

---

## Frontend Structure (`frontend/src/`)

### `components/`
**Purpose:** Highly cohesive, reusable React UI components segmented by feature domain

**Subfolders**

- `analysis`
- `chat`
- `documents`
- `lawyers`
- `layout`
- `ui`

---

### `pages/`
**Purpose:** Full React views tied to the router for specific feature sets

**Key Files**

- `LandingPage.jsx`
- `ChatPage.jsx`
- `AnalyzePage.jsx`
- `VerifyPage.jsx`

---

### `hooks/` and `context/`
**Purpose:** Custom React hooks and Context API setups to share application state contextually

**Key Files**

- `AuthContext.jsx`
- `AnalysisContext.jsx`

---

### `services/`
**Purpose:** JavaScript / Axios integration functions mapping exactly to backend API endpoints

**Key Files**

- `api.js`
- `analyzeService.js`

---

## 4. File Level Explanation

### `backend/app/main.py`
The main entry point for the FastAPI backend application.  
It wires up CORS configuration, mounts the endpoint routers, and starts the server instance.

### `backend/app/services/llm_orchestrator.py`
The brain of the AI system.  
It parses user input, determines the most suitable LLM provider (Groq vs Gemini), constructs the prompt with legal context, and streams the inference back.

### `frontend/src/App.jsx`
Main React component that defines browser routing configurations using **React Router** and renders active pages wrapped inside contexts and layout wrappers.

### `backend/app/services/firebase_service.py`
Connects via the **Firebase Admin SDK** to handle token verification and execute Firestore CRUD operations for user histories.

### `backend/app/routers/blockchain.py`
Intercepts requests for handling evidence and coordinates with IPFS libraries and the Polygon network to process transaction signing.

---

## 5. Feature Mapping

| Feature | Implementation |
|-------|------|
| User Authentication | `frontend/src/context/AuthContext.jsx` + `backend/app/routers/auth.py` |
| AI Dispute Analysis | `frontend/src/pages/AnalyzePage.jsx` + `backend/app/routers/analyze.py` + `backend/app/services/llm_orchestrator.py` |
| Legal Chat (RAG) | `frontend/src/components/chat/` + `backend/app/routers/chat.py` |
| Tamper-proof Evidence | `frontend/src/pages/VerifyPage.jsx` + `backend/app/services/blockchain_service.py` |
| Document Generation | `frontend/src/pages/DocumentsPage.jsx` + `backend/app/services/document_service.py` + `backend/app/templates/` |
| Lawyer Marketplace | `frontend/src/pages/LawyerMarketplacePage.jsx` + `backend/app/routers/lawyers.py` + `backend/app/services/lawyer_service.py` |

---

## 6. Data Flow

1. **User Interaction**  
   The user enters a scenario or uploads evidence on the frontend (`React / Tailwind`).

2. **Frontend Service**  
   The UI calls an Axios utility inside `frontend/src/services/*` to format an API request.

3. **API Routing**  
   The FastAPI application inside `backend/app/routers/*` receives the HTTP request and validates the incoming JSON body using **Pydantic models**.

4. **Business Logic Execution**  
   The router outsources processing to `backend/app/services/*`.

   - AI logic → `llm_orchestrator` retrieves context from **ChromaDB**, builds prompts, and calls external LLM APIs (Groq / Gemini).
   - Blockchain logic → uploads files to **IPFS** and triggers **Polygon smart contract transactions**.

5. **Database Logging**  
   Transaction details and results are asynchronously logged in **Firebase Firestore** via `firebase_service.py`.

6. **Response Generation**  
   The service returns a Python dictionary and the router converts it into JSON.

7. **UI Update**  
   The React frontend resolves the Promise, stores data via **React Context / State**, and re-renders the DOM to display results.

---

## 7. Technologies Used

| Technology | Purpose |
|-----------|--------|
| React.js & Vite | Component-based frontend and rapid build system |
| Tailwind CSS | Utility-first responsive styling framework |
| FastAPI (Python) | High-performance asynchronous backend framework |
| Firebase Auth & Firestore | Authentication and scalable NoSQL database |
| Groq & Gemini Flash | Fast LLM inference engines for reasoning tasks |
| ChromaDB & HuggingFace Embeddings | Vector database for Retrieval-Augmented Generation |
| Polygon (Amoy) & Pinata IPFS | Blockchain verification and decentralized evidence storage |

---

## 8. Summary

NyayMitra is an advanced, comprehensive legal-tech product that orchestrates several modern development paradigms.

The **React frontend** provides a seamless multilingual user experience to ingest complex legal scenarios. The **fast, asynchronous Python backend** routes varying workloads (AI, Blockchain, RAG, File System) to specialized services.

Together, these systems provide a unified architecture capable of delivering:

- fast legal assistance
- secure document generation
- grounded AI responses
- immutable blockchain evidence verification

Every directory serves a hyper-specific role inside a clear **Model–View–Controller style architecture**, ensuring high maintainability, scalability, and security.
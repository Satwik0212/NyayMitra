# NyayMitra Frontend Specification

**For Frontend Team — Build Independently Using This Doc**

* **Backend URL**: `http://localhost:8000` (dev) / TBD (production)
* **Tech Stack**: React 18 + Vite + TailwindCSS
* **Auth**: Firebase (project: `contractchain-0212`)

---

## 🗺️ Navigation Structure

```text
Landing Page (/)
├── Dispute Advisor (/analyze)
│   └── Analysis Results (/analyze/results)
│       ├── Legal Chat (/chat)
│       ├── Document Generator (/document)
│       ├── Process Navigator (/process/:type)
│       └── Evidence Upload (/evidence)
├── Contract Analysis → Opens LexChain (external link for now)
├── Verify (/verify)
├── Login (/login)
└── History (/history) [requires auth]
```

---

## Page 1: Landing Page (`/`)

### Layout
* Full-width hero section with gradient background
* Two main cards side by side (Dispute Advisor + Contract Analysis)
* Common issues quick-select grid below
* Language selector in navbar
* Disclaimer at bottom of every page

### Components

**Navbar (sticky, every page):**
* **Left**: Logo (🏛️) + "NyayMitra" + "न्यायमित्र"
* **Center**: Navigation links — "Dispute Advisor" | "Contract Analysis" | "Verify"
* **Right**: Language dropdown (🌐) + Login button / User avatar

**Hero Section:**
* **Heading**: "NyayMitra — न्यायमित्र"
* **Subheading**: "Your AI Legal Advocate — Instant Rights, Real Guidance"

**Two Entry Cards (side by side on desktop, stacked on mobile):**
* **Card 1 — Dispute Advisor:**
  * Icon: ⚖️
  * Title: "Dispute Advisor"
  * Description: "Facing a legal dispute? Describe your situation and get instant legal guidance in your language."
  * Button: "Get Legal Help →" (primary blue)
  * Action: Navigate to `/analyze`
* **Card 2 — Contract Analysis:**
  * Icon: 📄
  * Title: "Contract Analysis"
  * Description: "Have a contract to review? Upload and get instant AI-powered risk analysis, summary, and blockchain proof."
  * Button: "Analyze Contract →" (dark/black)
  * Action: `window.open(LEXCHAIN_URL, "_blank")`
  * `LEXCHAIN_URL` = env variable, default "https://lexchain.vercel.app"

**Common Issues Grid (6 items, 2 rows of 3 on mobile, 1 row on desktop):**
* 🏠 Landlord Dispute  → `/analyze?type=property`
* 💼 Salary Withheld   → `/analyze?type=labor`
* 🛒 Consumer Complaint → `/analyze?type=consumer`
* 🚗 Road Accident     → `/analyze?type=civil`
* 👨👩👧 Family Dispute    → `/analyze?type=family`
* 📄 Contract Problem  → `/analyze?type=corporate`

**Language Selector (dropdown, in navbar):**
* English (en)
* हिंदी (hi)
* தமிழ் (ta)
* తెలుగు (te)
* বাংলা (bn)
* मराठी (mr)
* ಕನ್ನಡ (kn)

> **Note:** Store selected language in `localStorage`. Send with every API request.

**Disclaimer Bar (fixed bottom or footer, every page):**
* ⚠️ NyayMitra provides legal information, NOT legal advice. Always consult a qualified advocate before taking action.

---

## Page 2: Dispute Analyzer (`/analyze`)

### Layout
* Text input area (large, multi-line)
* Voice input button
* Category quick-select chips
* Analyze button
* When results come back → show results on same page or navigate to results section

### Components

**Input Section:**
* Label: "Tell us about your legal situation:"
* Sublabel: "अपनी कानूनी समस्या बताएं:"
* Textarea: 6 rows, placeholder text:
  * "My landlord is refusing to return my ₹50,000 security deposit. I have the rental agreement and have lived there for 2 years. He claims there is damage but there isn't any."

**Voice Input Button (inside textarea, bottom-right):**
* Icon: 🎤 (mic icon)
* When active: Red pulsing icon + "Listening... Speak in any language"
* Uses browser Web Speech API:
  ```javascript
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  recognition.lang = 'hi-IN'  // or selected language
  recognition.interimResults = true
  recognition.continuous = true
  ```
* Append recognized text to textarea

**Category Chips (optional pre-select):**
* 🏠 Tenancy | 💼 Employment | 🛒 Consumer | 👨👩👧 Family | 🚗 Accident | ⚖️ Criminal | 🏡 Property | 📄 Contract
* Selected chip adds a hint to the API request.

**Analyze Button:**
* Label: "⚖️ Analyze"  (or "विश्लेषण करें" in Hindi)
* Loading state: spinner + "Analyzing your dispute..."
* Full width, primary color
* Disabled if textarea is empty

### API Call
```http
POST /api/v1/analyze
Content-Type: application/json
Authorization: Bearer <token>  (optional — works without auth too)

Body:
{
  "text": "<user's dispute text>",
  "language": "auto"
}
```

### Response Data Structure (`DisputeResponse`)
```json
{
  "id": "uuid",
  "timestamp": "ISO string",
  "summary": "Brief AI summary of the analysis",
  "urgency_level": "normal | urgent | emergency",
  "domain": "CIVIL | CRIMINAL | CORPORATE | FAMILY | PROPERTY | LABOR | CONSUMER | CONSTITUTIONAL",
  "applicable_laws": [
    {
      "act": "Maharashtra Rent Control Act 1999",
      "sections": ["Section 16", "Section 19"],
      "relevance": "Governs security deposit disputes"
    }
  ],
  "user_rights": [
    {
      "right": "Landlord must return deposit within 30 days",
      "citation": "Section 16(2), MRC Act 1999",
      "explanation": "The law mandates timely return..."
    }
  ],
  "recommended_actions": [
    {
      "step": 1,
      "action": "Send a legal notice via registered post",
      "timeline": "Wait 15 days for response",
      "estimated_cost": "₹100-500",
      "difficulty": "easy",
      "documents_needed": ["Rental agreement", "Payment receipts"]
    }
  ],
  "is_contract": true,
  "contract_analysis": {
    "party_a": {
      "role": "Tenant",
      "strength": 8,
      "strengths": ["Has rental agreement", "Paid all rent on time"],
      "weaknesses": ["No photographic evidence of property condition"]
    },
    "party_b": {
      "role": "Landlord",
      "strength": 3,
      "strengths": ["Property owner"],
      "weaknesses": ["No proof of damage", "Violated deposit return timeline"]
    },
    "mediation_suggestion": "Negotiate 80% return with minor deductions..."
  },
  "triage_info": {
    "urgency_level": "normal | urgent | emergency",
    "emergency_helplines": {
      "Police": "100",
      "Women Helpline": "181"
    },
    "suggested_action": "..."
  }
}
```

---

## Page 3: Analysis Results (shown after analysis completes)

### Layout
* Urgency banner at top (color-coded)
* Domain + applicable laws badges
* Tabbed section: "Your Rights" | "Dual-Party View"
* Contract redirect card (if `is_contract=true`)
* Recommended actions timeline
* Evidence checklist with checkboxes
* Action buttons row at bottom

### Components

**Urgency Banner (top of results):**
* `emergency` → Red banner: "🚨 CRITICAL — Act Immediately" + Show helpline phone buttons (tap to call)
* `urgent`    → Amber banner: "⚡ URGENT — Act within 1-2 weeks"
* `normal`    → Green banner: "✅ Standard"

**Domain + Laws Section:**
* Title: "📋 {domain}" (e.g., "📋 Tenancy Dispute")
* Below: Horizontal scrollable chips for each applicable law
  * e.g., `[Maharashtra Rent Control Act 1999]` `[Indian Contract Act 1872]`

**Tabs: Rights vs Dual-Party View:**
* **Tab 1 — Your Rights:**
  * For each right in `user_rights`:
    * Right title (bold)
    * Citation badge: "📖 Section 16(2), MRC Act 1999" (small, colored)
    * Explanation text (gray, smaller)
* **Tab 2 — Dual-Party View:**
  * Two columns side by side:
    * **LEFT COLUMN (green tint):**
      * "👤 {party_a.role}" (e.g., "Tenant")
      * Strength bar: `[████████──] 8/10`
      * Strengths: ✅ bullet points
      * Weaknesses: ⚠️ bullet points
    * **RIGHT COLUMN (red tint):**
      * "👤 {party_b.role}" (e.g., "Landlord")
      * Strength bar: `[███───────] 3/10`
      * Strengths: ✅ bullet points
      * Weaknesses: ⚠️ bullet points
  * Below both columns:
    * "🤝 Mediation Suggestion" box with yellow/amber background
    * Text: `mediation_suggestion`

**Contract Redirect Card (only show if `is_contract=true`):**
* Blue/indigo gradient card:
  * Icon: 📄
  * Title: "Contract Detected!"
  * Text: "You mentioned a contract/agreement. Want to analyze it for risks, get a summary, and verify on blockchain?"
  * Button 1: "Upload & Analyze Contract →" (opens LexChain in new tab)
  * Button 2: "Skip for now" (dismisses the card)
  * X button in corner to dismiss

**Recommended Actions (step timeline):**
* For each action in `recommended_actions`:
  * Circle with step number (1, 2, 3...)
  * Connected by vertical line
  * Each step shows:
    * Action title (bold)
    * Timeline: ⏱ "Wait 15 days"
    * Cost: 💰 "₹100-500"
    * Difficulty badge: `easy` (green) | `medium` (amber) | `hard` (red)
    * Documents needed: 📎 comma-separated list

**Evidence Checklist:**
* Title: "📋 Evidence Checklist"
* Interactive checkboxes — user can tick off items they've gathered
  * `[ ]` Original rental agreement
  * `[ ]` Rent payment receipts / bank statements
  * `[✓]` Photos of property condition at move-out
* Progress: "1/3 gathered"

**Action Buttons (bottom row, 4 buttons):**
* `[💬 Ask Questions]`     → Navigate to `/chat` (pass analysis data via state/context)
* `[📄 Generate Notice]`   → Navigate to `/document` (pass analysis data)
* `[🗺️ View Process]`     → Navigate to `/process/{domain}`
* `[🔄 New Analysis]`      → Reset, go back to input

**Additional Action Buttons (secondary row):**
* `[🔗 Log on Blockchain]`  → POST `/api/v1/blockchain/log`
* `[📎 Secure Evidence]`    → Navigate to `/evidence`
* `[📚 Similar Cases]`      → Navigate to `/precedents/{domain}`

---

## Page 4: Legal Chat (`/chat`)

### Layout
* Chat window (messages list)
* Input bar at bottom with send button
* Follow-up question chips after each AI response

### Components

**Chat Header:**
* Icon: 💬
* Title: "Legal Chat — {domain}" (e.g., "Legal Chat — Tenancy Dispute")
* Subtitle: "Powered by Indian legal corpus • RAG-grounded responses"

**Message List:**
* **User messages**: Right-aligned, blue background, white text, rounded
* **AI messages**: Left-aligned, white background with border, Bot avatar (⚖️) on left
* AI messages also show:
  * **Citations**: Small blue chips below message
    * e.g., `[📖 Section 16, MRC Act 1999]` `[📖 Section 106, TPA 1882]`
  * **Follow-up suggestions**: Clickable chips below citations
    * e.g., `[What documents for Rent Court?]` `[How long will the case take?]` `[Can I claim compensation?]`
    * Clicking a chip sends that text as the next message

**Input Bar:**
* Text input: "Type your question..."
* Send button: "📤 Send"
* Disable input while AI is responding
* Show typing indicator (three dots animation) while waiting

### API Calls

**Standard Chat:**
```http
POST /api/v1/chat
Body:
{
  "message": "user's question text",
  "history": [
    {"role": "user", "content": "previous question"},
    {"role": "assistant", "content": "previous answer"}
  ]
}

Response:
{
  "response": "AI's answer text with legal citations..."
}
```

**Streaming Chat (preferred — real-time token display):**
```http
POST /api/v1/chat/stream
Body: same as above

Response: Server-Sent Events (SSE)
  data: {"token": "To"}
  data: {"token": " file"}
  data: {"token": " a"}
  ...
  data: {"done": true}
```

**Implementation example:**
```javascript
const response = await fetch('/api/v1/chat/stream', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message, history})
});
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const {value, done} = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  const lines = text.split('\n').filter(l => l.startsWith('data: '));
  for (const line of lines) {
    const data = JSON.parse(line.slice(6));
    if (data.done) return;
    appendToken(data.token);  // Append to current message display
  }
}
```

---

## Page 5: Document Generator (`/document`)

### Layout
* Document type selector (4 options)
* Form fields (names, addresses)
* Generate button
* Preview pane showing rendered HTML
* Download PDF button

### Components

**Document Type Selector (4 cards/buttons):**
* 📋 Legal Notice       → `doc_type: "legal_notice"`
* 🛒 Consumer Complaint → `doc_type: "consumer_complaint"`
* 📝 RTI Application    → `doc_type: "rti"`
* 🚔 FIR Helper Text    → `doc_type: "fir_helper"`

**Form Fields:**
* Your Name: text input (pre-fill from auth if logged in)
* Opponent/Recipient Name: text input
* Dispute Summary: textarea (pre-fill from analysis if navigated from results)
* Language: dropdown (en/hi)

**Generate Button:**
* Label: "📄 Generate Document"
* Loading: spinner + "Generating..."

**Preview Pane:**
* Show the HTML content rendered in a bordered container
* Looks like a real document
* Scrollable if long

**Action Buttons (after generation):**
* `[📥 Download PDF]`  → Use `html2pdf.js` to convert preview to PDF
* `[✏️ Edit & Regenerate]` → Go back to form

### API Call
```http
POST /api/v1/generate-document
Body:
{
  "doc_type": "legal_notice",
  "dispute_summary": "Landlord refusing deposit...",
  "sender_name": "Ramesh Kumar",
  "recipient_name": "Mr. Sharma",
  "language": "en"
}

Response:
{
  "html_content": "<h1>LEGAL NOTICE</h1><p>SENT BY REGISTERED POST...</p>..."
}
```

**PDF Download (client-side using `html2pdf.js`):**
```javascript
import html2pdf from 'html2pdf.js';
const element = document.getElementById('doc-preview');
html2pdf().set({
  margin: [15, 15, 15, 15],
  filename: `NyayMitra_${docType}_${Date.now()}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
}).from(element).save();
```

---

## Page 6: Evidence Upload (`/evidence`)

### Layout
* File upload zone (drag-and-drop)
* Per-file description field
* Upload + Secure button
* Results showing hashes, IPFS links, blockchain proof

### Components

**Upload Zone:**
* Drag-and-drop area with dashed border
* Text: "Drop evidence files here or click to browse"
* Subtext: "PDF, JPG, PNG, WEBP — Max 10 MB per file"
* Allow multiple files

**Per-File Card (shown for each uploaded file):**
* File icon + filename + size
* Text input: "Describe this evidence (2 lines)"
  * placeholder: "Photo of property damage, taken before vacating on 15 March 2025"
* Remove button (X)

**Upload Button:**
* Label: "🔒 Secure Evidence on Blockchain"
* Loading: spinner + "Uploading to IPFS + storing hash on Polygon..."

**Results (shown after upload):**
* For each file:
  * ✅ filename.pdf
  * SHA-256 Hash: `7f83b165...`
  * IPFS Link: `https://gateway.pinata.cloud/ipfs/Qm...` (clickable, opens in new tab)
* Master Hash: `d4d51d23...`
* Blockchain: ✅ Stored on Polygon Amoy
  * TX Hash: `0x686f00...` (clickable → opens PolygonScan)
  * Block: `#35148754`

### API Call
```http
POST /api/v1/blockchain/evidence
Content-Type: multipart/form-data

FormData:
  files: [File, File, ...]  (multiple files)
  descriptions: ["Description 1", "Description 2", ...]

Response:
{
  "success": true,
  "evidence_id": "uuid",
  "timestamp": "ISO string",
  "files": [
    {
      "filename": "rental_agreement.pdf",
      "description": "...",
      "sha256_hash": "...",
      "ipfs_cid": "...",
      "ipfs_url": "https://gateway.pinata.cloud/ipfs/...",
      "ipfs_success": true,
      "file_size": 146
    }
  ],
  "master_hash": "...",
  "metadata_ipfs_cid": "...",
  "metadata_ipfs_url": "...",
  "blockchain": {
    "success": true,
    "tx_hash": "0x...",
    "block_number": 35148754,
    "polygonscan_url": "https://amoy.polygonscan.com/tx/0x..."
  }
}
```

---

## Page 7: Process Navigator (`/process/:type`)

### Layout
* Title + description
* Step-by-step accordion/timeline
* Each step expandable with details

### Available Types
* `/process/consumer_forum`
* `/process/rent_tribunal` 
* `/process/fir_process` 
* `/process/rti_filing` 

### API Call
```http
GET /api/v1/process-flow/{type}
e.g., GET /api/v1/process-flow/consumer_forum

Response:
{
  "flow_type": "consumer_forum",
  "title": "Consumer Court Complaint Process",
  "steps": [
    {
      "step_number": 1,
      "title": "Send a Legal Notice",
      "description": "Before filing a complaint, send a formal legal notice...",
      "duration_estimate": "15-30 days",
      "cost_estimate": "₹100-500",
      "documents_required": ["Product details", "Bills", "Communication records"],
      "tips": "Send via registered post with acknowledgment"
    }
  ]
}
```

### Components

**Step Accordion:**
* Each step is a collapsible card
* Left side: Circle with step number (colored based on completion)
  * Step 1 (completed) → green
  * Step 2 (current) → blue
  * Step 3+ (upcoming) → gray
* Expanded step shows:
  * Description text
  * ⏱ Duration estimate
  * 💰 Cost estimate
  * 📎 Documents required (bulleted list)
  * 💡 Tips (highlighted box)

**Step connector:**
* Vertical line connecting step circles
* Forms a visual timeline

---

## Page 8: Verify Blockchain Record (`/verify`)

### Layout
* Text input for transaction hash
* Verify button
* Result display (verified/not found)

### Components
* Title: "🔗 Blockchain Verification"
* Subtitle: "Verify that a dispute or evidence record exists on Polygon blockchain"
* Input: "Enter transaction hash (0x...)" (monospace font)
* Button: "🔍 Verify Record"
* Result (success):
  * ✅ Green box
  * "Record Verified ✓"
  * "Block #12345678 • Status: confirmed"
  * Link to PolygonScan
* Result (not found):
  * ❌ Red box
  * "Verification Failed"
  * "Record not found on Polygon Amoy"

### API Call
```http
GET /api/v1/blockchain/verify/{tx_hash}

Response (found):
{
  "verified": true,
  "block_number": 35148520,
  "gas_used": 95555,
  "status": "confirmed",
  "polygonscan_url": "https://amoy.polygonscan.com/tx/0x..."
}

Response (not found):
{
  "verified": false,
  "error": "Transaction not found on Polygon Amoy"
}
```

---

## Page 9: Login (`/login`)

### Layout
* Centered card with Google sign-in + email/password form

### Components
* Title: "Welcome to NyayMitra"
* `[Google Sign-In Button]`  → Firebase Google OAuth
* --- or ---
* Email input
* Password input
* `[Sign In]` button
* `[Create Account]` toggle

**Uses Firebase JS SDK:**
```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider,
         signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
```

### Firebase Config
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "contractchain-0212.firebaseapp.com",
  projectId: "contractchain-0212",
  storageBucket: "contractchain-0212.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```
*(Get these values from Firebase Console → Project Settings → General → Your apps → Web app config.)*

### After Login
```http
POST /api/v1/auth/login
Body: { "id_token": "<Firebase ID token>" }

Get token: const token = await user.getIdToken()
```
* Store token in `localStorage` or context
* Send with every API request: `Authorization: Bearer <token>`

---

## Page 10: History (`/history`) — Requires Auth

### Layout
* List of past analyses
* Each item clickable to view full analysis

### API Call
```http
GET /api/v1/history
Headers: Authorization: Bearer <token>

Response: Array of past analyses with id, summary, domain, timestamp
```

---

## Page 11: Case Precedents (`/precedents/:domain`)

### API Call
```http
GET /api/v1/precedents/{domain}
Valid domains: civil, criminal, corporate, family, property, labor, consumer, constitutional

Response: Array of landmark cases with case_name, year, court, ruling_summary
```

---

## Page 12: Legislative Updates (`/updates`)

### API Call
```http
GET /api/v1/updates

Response: Array of recent legal changes with act_name, year, summary, key_changes
```

---

## 🛠️ Global Patterns

### Auth State Management
* Use React Context or Zustand
* Store: `{ user, token, isLoggedIn, language }`
* On app load: check Firebase auth state
* If logged in: fetch token, store in state
* Send token in `Authorization` header for all requests
* **Auth is OPTIONAL** for analyze/chat/document — they work without login
* **Auth is REQUIRED** for history

### Error Handling
* All API errors return:
  ```json
  {
    "error": true,
    "message": "Human readable error",
    "status_code": 500
  }
  ```
* Show toast/snackbar notification for errors
* Never crash the app — show fallback UI

### Mobile Responsive
* All pages must work on mobile
* Landing page cards: stack vertically
* Chat: full screen on mobile
* Dual-party view: stack vertically on mobile
* Process navigator: works as vertical timeline

### Wallet Balance Display (optional — show in navbar or settings)
```http
GET /api/v1/blockchain/wallet-balance
Response: { "balance_matic": "5.108", "sufficient": true }
```

### NPM Packages to Install
```bash
npm install react-router-dom        # Routing
npm install react-markdown          # Render AI markdown responses
npm install html2pdf.js             # PDF download for documents
npm install react-i18next i18next   # Multi-language UI
npm install framer-motion           # Animations
npm install lucide-react            # Icons
npm install firebase                # Auth
npm install recharts                # Charts (strength bars)
```

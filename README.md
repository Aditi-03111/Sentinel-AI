# Sentinel AI

An adaptive AI-powered document learning assistant. Upload any PDF and instantly get grade-adapted answers, document insights, an interactive quiz, and a visual mind map — all powered by a custom RAG engine and Groq/Llama 3.1.

**Live Demo:** https://sentinel-ai-six-zeta.vercel.app

---

## Features

- **Chat** — Ask anything about your uploaded document. Answers are adapted to your selected class level (1–12) with page citations.
- **Insights Panel** — Auto-generated summary, key topics, and important terms extracted from the document on upload.
- **Quiz Mode** — Generate MCQs from the document at your grade level. Includes explanations, a score tracker, and a stats card (correct / wrong / accuracy) at the end.
- **Mind Map** — Visual concept graph of the document's key ideas using an interactive node-edge layout.
- **PDF Viewer** — Side-by-side PDF viewer with citation-linked page navigation.
- **Maximize / Minimize** — Each tab (Chat, Quiz, Map) can be expanded to full screen, hiding the insights panel and PDF viewer.
- **Dark / Light theme** — Toggle via the navbar.

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React + Vite | UI framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| @xyflow/react | Mind map graph rendering |
| Axios | API calls |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | REST API |
| PyPDF (`pypdf`) | PDF text extraction |
| Custom TF-IDF | In-memory retrieval (no vector DB) |
| Groq API | LLM inference |
| Llama 3.1 8B Instant | Default generation model |

### RAG Architecture
No external RAG framework. Built from scratch:
- **Retrieval** — `vector_store.py`: BM25-style TF-IDF scoring over page-chunked documents, fully in-memory.
- **Generation** — `rag_engine.py`: Top-3 retrieved chunks passed as context to Groq's `llama-3.1-8b-instant` with grade-adaptive prompts.

---

## Project Structure

```
├── main.py               # FastAPI app, all API routes
├── rag_engine.py         # LLM calls: answer, insights, quiz, mindmap
├── vector_store.py       # Custom TF-IDF retriever
├── pdf_utils.py          # PDF text extraction
├── requirements.txt
├── render.yaml           # Render deployment config
└── frontend_web/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── MainChat.jsx
    │   │   ├── ChatInput.jsx
    │   │   ├── QuizMode.jsx
    │   │   ├── MindMap.jsx
    │   │   ├── InsightsPanel.jsx
    │   │   ├── PDFViewer.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   └── ThemeContext.jsx
    └── .env.example
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/upload` | Upload a PDF, extract and index text |
| `GET` | `/insights` | Get summary, topics, key terms |
| `GET` | `/ask?question=&grade=` | Ask a question, get a grade-adapted answer |
| `GET` | `/quiz?grade=&num_questions=` | Generate MCQ quiz |
| `GET` | `/mindmap` | Generate concept mind map |
| `GET` | `/health` | Health check |

---

## Local Setup

### Backend

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp .env.example .env
# Add your GROQ_API_KEY to .env

# 4. Run the server
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend_web

# 1. Install dependencies
npm install

# 2. Configure API URL
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# 3. Start dev server
npm run dev
```

---

## Environment Variables

### Backend (`.env`)
| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key — get one at https://console.groq.com |
| `GROQ_MODEL` | Model to use (default: `llama-3.1-8b-instant`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (default: `*`) |

### Frontend (`frontend_web/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `http://localhost:8000`) |

---

## Deployment

**Backend** — Render (configured via `render.yaml`)
- Set `GROQ_API_KEY` and `ALLOWED_ORIGINS` as environment variables in the Render dashboard.

**Frontend** — Vercel
- Set `VITE_API_URL` to your Render backend URL in Vercel project settings.

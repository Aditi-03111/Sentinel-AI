from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from dotenv import load_dotenv

load_dotenv()

from pdf_utils import extract_text_from_pdf
from vector_store import add_documents
from rag_engine import generate_answer, generate_insights, generate_quiz, generate_mindmap

app = FastAPI()

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

_document_store: dict = {}  # stores full_text, page_count, filename, size, uploaded_at


@app.get("/")
def read_root():
    return {"message": "Sentinel Notes API v2", "docs": "http://127.0.0.1:8000/docs"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    docs = extract_text_from_pdf(file_path)
    add_documents(docs)

    full_text = "\n\n".join(d["text"] for d in docs)
    file_size = os.path.getsize(file_path)

    _document_store["current"] = {
        "full_text": full_text,
        "page_count": len(docs),
        "filename": file.filename,
        "size": file_size,
    }

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename,
        "pages": len(docs),
        "size": file_size,
    }


@app.get("/insights")
def get_insights():
    try:
        doc = _document_store.get("current")
        if not doc:
            return {"error": "No document uploaded yet."}
        result = generate_insights(doc["full_text"], doc["page_count"])
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/mindmap")
def get_mindmap():
    try:
        doc = _document_store.get("current")
        if not doc:
            return {"error": "No document uploaded yet."}
        result = generate_mindmap(doc["full_text"])
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/quiz")
def get_quiz(grade: int = 10, num_questions: int = 5):
    try:
        doc = _document_store.get("current")
        if not doc:
            return {"error": "No document uploaded yet."}
        result = generate_quiz(doc["full_text"], grade=grade, num_questions=num_questions)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/ask")
def ask_question(question: str, grade: int = 10):
    try:
        answer, citations = generate_answer(question, grade=grade)
        return {"answer": answer, "citations": citations}
    except Exception as e:
        return {"error": str(e)}

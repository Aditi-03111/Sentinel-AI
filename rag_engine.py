import re
import json
import os
from groq import Groq
from vector_store import query_collection

# ---------------------------------------------------------------------------
# Groq client — set GROQ_API_KEY env var on Render
# ---------------------------------------------------------------------------
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))
MODEL = "llama-3.1-8b-instant"

GRADE_PROFILES = {
    1:  "Explain like the student is 6 years old (Class 1). Use very simple words, short sentences, and fun real-life comparisons. Avoid all technical terms.",
    2:  "Explain like the student is 7 years old (Class 2). Use simple words and easy analogies. No jargon.",
    3:  "Explain like the student is 8 years old (Class 3). Use everyday examples and simple cause-effect reasoning.",
    4:  "Explain like the student is 9 years old (Class 4). Introduce basic subject-specific words but always explain them in plain language.",
    5:  "Explain like the student is 10 years old (Class 5). Use relatable analogies and introduce simple definitions. Avoid complex formulas.",
    6:  "Explain like the student is 11 years old (Class 6). Use clear definitions and basic subject terminology.",
    7:  "Explain like the student is 12 years old (Class 7). Use proper subject terminology with brief explanations and simple examples.",
    8:  "Explain like the student is 13 years old (Class 8). Use standard academic language. Include basic formulas or processes where relevant.",
    9:  "Explain like the student is 14 years old (Class 9). Use precise academic language, introduce equations or structured processes.",
    10: "Explain like the student is 15 years old (Class 10). Use full technical terminology, chemical equations, biological terms, and structured explanations.",
    11: "Explain like the student is 16 years old (Class 11). Use advanced subject-specific language, derivations, and in-depth conceptual explanations.",
    12: "Explain like the student is 17 years old (Class 12). Use expert-level academic language, detailed analysis, and comprehensive technical depth.",
}


def _call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.3,
    )
    return response.choices[0].message.content


def generate_answer(question: str, grade: int = 10):
    results = query_collection(question)
    context = ""
    citations = []
    for doc, metadata in zip(results["documents"][0], results["metadatas"][0]):
        context += doc + "\n\n"
        citations.append(metadata["page"])

    grade = max(1, min(12, grade))
    grade_instruction = GRADE_PROFILES[grade]

    prompt = f"""You are an adaptive educational AI assistant.

{grade_instruction}

Answer the question based ONLY on the context below. Tailor your vocabulary, depth, and examples strictly to the grade level described above.

Context:
{context}

Question:
{question}

Answer:"""

    answer = _call_groq(prompt)
    return answer, citations


def generate_insights(full_text: str, page_count: int):
    excerpt = full_text[:5000]

    prompt = f"""You are an expert document analyst. Analyze the document and respond with ONLY valid JSON, no extra text, no markdown fences.

Return this exact JSON structure:
{{
  "summary": "2-3 sentence summary of the document",
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "key_terms": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5", "Term 6", "Term 7", "Term 8"]
}}

Document:
{excerpt}

JSON:"""

    raw = _call_groq(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            topics = data.get("topics", [])
            key_terms = data.get("key_terms", [])
            return {
                "summary": data.get("summary", ""),
                "topics": topics[:6],
                "key_terms": key_terms[:8],
                "stats": {
                    "pages": page_count,
                    "topics": len(topics),
                    "terms": len(key_terms)
                }
            }
        except json.JSONDecodeError:
            pass

    return {
        "summary": raw[:300],
        "topics": [],
        "key_terms": [],
        "stats": {"pages": page_count, "topics": 0, "terms": 0}
    }


def generate_mindmap(full_text: str):
    excerpt = full_text[:5000]

    prompt = f"""You are a knowledge graph extractor. Analyze the document and extract a mind map.
Respond with ONLY valid JSON, no extra text, no markdown fences.

Rules:
- "central" is the single root topic (2-4 words max)
- "nodes" is a flat list with "id" (short slug, no spaces) and "label" (display name)
- "edges" is a list with "source" and "target" node ids
- The central node id must be "root"
- Include 8-14 concept nodes total
- Keep labels short (1-4 words)

Return exactly:
{{
  "central": "Main Topic",
  "nodes": [
    {{"id": "root", "label": "Main Topic"}},
    {{"id": "node1", "label": "Concept One"}}
  ],
  "edges": [
    {{"source": "root", "target": "node1"}}
  ]
}}

Document:
{excerpt}

JSON:"""

    raw = _call_groq(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            if "nodes" in data and "edges" in data:
                return data
        except json.JSONDecodeError:
            pass
    return {"central": "Document", "nodes": [{"id": "root", "label": "Document"}], "edges": []}


def generate_quiz(full_text: str, grade: int = 10, num_questions: int = 5):
    excerpt = full_text[:4000]
    grade_instruction = GRADE_PROFILES[max(1, min(12, grade))]

    prompt = f"""You are a quiz generator. {grade_instruction}

Generate {num_questions} multiple choice questions based on the document below.
Respond with ONLY valid JSON, no extra text, no markdown fences.

Return this exact JSON structure:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "answer": "A) Option 1",
      "explanation": "Brief explanation why this is correct."
    }}
  ]
}}

Document:
{excerpt}

JSON:"""

    raw = _call_groq(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {"questions": []}

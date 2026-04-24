import re
import json
import requests
from vector_store import query_collection

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"

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


def _call_ollama(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "prompt": prompt, "stream": False}
    )
    return response.json()["response"]


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

    answer = _call_ollama(prompt)
    return answer, citations


def generate_insights(full_text: str, page_count: int):
    """Returns structured insights: summary, topics list, key_terms list, stats."""
    excerpt = full_text[:5000]

    prompt = f"""You are an expert document analyst. Analyze the document and respond with ONLY valid JSON, no extra text.

Return this exact JSON structure:
{{
  "summary": "2-3 sentence summary of the document",
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "key_terms": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5", "Term 6", "Term 7", "Term 8"]
}}

Document:
{excerpt}

JSON:"""

    raw = _call_ollama(prompt)

    # Extract JSON from response
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

    # Fallback
    return {
        "summary": raw[:300],
        "topics": [],
        "key_terms": [],
        "stats": {"pages": page_count, "topics": 0, "terms": 0}
    }


def generate_mindmap(full_text: str):
    """Extract concepts and relationships for a mind map."""
    excerpt = full_text[:5000]

    prompt = f"""You are a knowledge graph extractor. Analyze the document and extract a mind map.
Respond with ONLY valid JSON, no extra text, no markdown fences.

Rules:
- "central" is the single root topic (the document's main subject, 2-4 words max)
- "nodes" is a flat list of concept objects, each with "id" (short slug, no spaces) and "label" (display name)
- "edges" is a list of connections, each with "source" (node id) and "target" (node id)
- The central node id must be "root"
- Include 8-14 concept nodes total
- Connect related concepts to each other, not just to root
- Keep labels short (1-4 words)

Return exactly:
{{
  "central": "Main Topic",
  "nodes": [
    {{"id": "root", "label": "Main Topic"}},
    {{"id": "node1", "label": "Concept One"}},
    {{"id": "node2", "label": "Concept Two"}}
  ],
  "edges": [
    {{"source": "root", "target": "node1"}},
    {{"source": "root", "target": "node2"}},
    {{"source": "node1", "target": "node2"}}
  ]
}}

Document:
{excerpt}

JSON:"""

    raw = _call_ollama(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            # Validate structure
            if "nodes" in data and "edges" in data:
                return data
        except json.JSONDecodeError:
            pass
    return {"central": "Document", "nodes": [{"id": "root", "label": "Document"}], "edges": []}


def generate_quiz(full_text: str, grade: int = 10, num_questions: int = 5):
    """Generate MCQ quiz questions from the document."""
    excerpt = full_text[:4000]
    grade_instruction = GRADE_PROFILES[max(1, min(12, grade))]

    prompt = f"""You are a quiz generator. {grade_instruction}

Generate {num_questions} multiple choice questions based on the document below.
Respond with ONLY valid JSON, no extra text.

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

    raw = _call_ollama(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {"questions": []}

import json
import os
import re
from collections import Counter

from groq import Groq

from vector_store import query_collection


client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))
MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")

GRADE_PROFILES = {
    1: "Explain like the student is 6 years old (Class 1). Use very simple words, short sentences, and fun real-life comparisons. Avoid all technical terms.",
    2: "Explain like the student is 7 years old (Class 2). Use simple words and easy analogies. No jargon.",
    3: "Explain like the student is 8 years old (Class 3). Use everyday examples and simple cause-effect reasoning.",
    4: "Explain like the student is 9 years old (Class 4). Introduce basic subject-specific words but always explain them in plain language.",
    5: "Explain like the student is 10 years old (Class 5). Use relatable analogies and introduce simple definitions. Avoid complex formulas.",
    6: "Explain like the student is 11 years old (Class 6). Use clear definitions and basic subject terminology.",
    7: "Explain like the student is 12 years old (Class 7). Use proper subject terminology with brief explanations and simple examples.",
    8: "Explain like the student is 13 years old (Class 8). Use standard academic language. Include basic formulas or processes where relevant.",
    9: "Explain like the student is 14 years old (Class 9). Use precise academic language, introduce equations or structured processes.",
    10: "Explain like the student is 15 years old (Class 10). Use full technical terminology, chemical equations, biological terms, and structured explanations.",
    11: "Explain like the student is 16 years old (Class 11). Use advanced subject-specific language, derivations, and in-depth conceptual explanations.",
    12: "Explain like the student is 17 years old (Class 12). Use expert-level academic language, detailed analysis, and comprehensive technical depth.",
}

_JSON_DECODER = json.JSONDecoder()
_CONTENT_STOP_WORDS = {
    "about",
    "after",
    "also",
    "because",
    "between",
    "could",
    "from",
    "have",
    "into",
    "only",
    "other",
    "should",
    "such",
    "than",
    "that",
    "their",
    "there",
    "these",
    "this",
    "through",
    "under",
    "when",
    "where",
    "which",
    "while",
    "with",
    "would",
}


def _call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.3,
    )
    return response.choices[0].message.content


def _extract_json_object(raw: str):
    text = (raw or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    for index, char in enumerate(text):
        if char != "{":
            continue
        try:
            parsed, _ = _JSON_DECODER.raw_decode(text[index:])
            return parsed
        except json.JSONDecodeError:
            continue
    return None


def _keyword_terms(text: str, limit: int = 8) -> list[str]:
    tokens = [
        token.lower()
        for token in re.findall(r"[A-Za-z][A-Za-z0-9-]{3,}", text)
        if token.lower() not in _CONTENT_STOP_WORDS
    ]
    return [term.title() for term, _ in Counter(tokens).most_common(limit)]


def _sentence_candidates(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    candidates = []

    for sentence in sentences:
        sentence = sentence.strip(" -\t\n")
        word_count = len(sentence.split())
        if 8 <= word_count <= 42:
            candidates.append(sentence)

    if candidates:
        return candidates

    chunks = []
    words = normalized.split()
    for index in range(0, len(words), 28):
        chunk = " ".join(words[index:index + 28]).strip()
        if chunk:
            chunks.append(chunk)
    return chunks


def _shorten(text: str, limit: int = 190) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "..."


def _strip_option_prefix(option: str) -> str:
    return re.sub(r"^[A-Da-d]\)\s*", "", str(option)).strip()


def _normalize_quiz(data, num_questions: int):
    questions = data.get("questions") if isinstance(data, dict) else None
    if not isinstance(questions, list):
        return {"questions": []}

    normalized = []
    for item in questions[:num_questions]:
        if not isinstance(item, dict):
            continue

        question = str(item.get("question", "")).strip()
        raw_options = item.get("options", [])
        if not question or not isinstance(raw_options, list):
            continue

        option_texts = [_strip_option_prefix(option) for option in raw_options if str(option).strip()]
        option_texts = [option for option in option_texts if option][:4]
        if len(option_texts) < 2:
            continue

        while len(option_texts) < 4:
            option_texts.append("Not enough information in the document")

        raw_answer = str(item.get("answer", "")).strip()
        answer_text = _strip_option_prefix(raw_answer)
        answer_index = 0
        letter_match = re.match(r"^([A-Da-d])\)?", raw_answer)
        if letter_match:
            answer_index = ord(letter_match.group(1).upper()) - ord("A")
            answer_index = max(0, min(answer_index, len(option_texts) - 1))
        else:
            for index, option in enumerate(option_texts):
                if answer_text.lower() == option.lower() or answer_text.lower() in option.lower():
                    answer_index = index
                    break

        options = [f"{letter}) {_shorten(option, 140)}" for letter, option in zip("ABCD", option_texts)]
        normalized.append(
            {
                "question": question,
                "options": options,
                "answer": options[answer_index],
                "explanation": str(item.get("explanation", "This is supported by the uploaded document.")).strip(),
            }
        )

    return {"questions": normalized}


def _fallback_insights(full_text: str, page_count: int):
    sentences = _sentence_candidates(full_text)
    summary = " ".join(sentences[:2]) if sentences else _shorten(full_text, 300)
    key_terms = _keyword_terms(full_text, 8)
    topics = key_terms[:6]
    return {
        "summary": _shorten(summary, 420),
        "topics": topics,
        "key_terms": key_terms,
        "stats": {"pages": page_count, "topics": len(topics), "terms": len(key_terms)},
    }


def _fallback_mindmap(full_text: str):
    terms = _keyword_terms(full_text, 10)
    central = terms[0] if terms else "Document"
    nodes = [{"id": "root", "label": central}]
    edges = []

    for index, term in enumerate(terms[1:10], start=1):
        node_id = f"node{index}"
        nodes.append({"id": node_id, "label": term})
        edges.append({"source": "root", "target": node_id})

    return {"central": central, "nodes": nodes, "edges": edges}


def _fallback_quiz(full_text: str, num_questions: int):
    candidates = _sentence_candidates(full_text)
    if not candidates:
        return {"questions": []}

    generic_options = [
        "The document says this topic is unrelated to the lesson",
        "The document states that no process or concept is involved",
        "The document focuses only on unrelated examples",
    ]
    questions = []

    for index in range(max(1, min(num_questions, 10))):
        source_sentence = candidates[index % len(candidates)]
        correct = _shorten(source_sentence)
        topic = (_keyword_terms(correct, 1) or ["The Document"])[0]
        distractors = [
            _shorten(sentence)
            for sentence in candidates
            if sentence != source_sentence
        ][:3]
        raw_options = ([correct] + distractors + generic_options)[:4]
        correct_index = index % 4
        raw_options[0], raw_options[correct_index] = raw_options[correct_index], raw_options[0]

        options = [f"{letter}) {option}" for letter, option in zip("ABCD", raw_options)]
        questions.append(
            {
                "question": f"Which statement is supported by the document about {topic}?",
                "options": options,
                "answer": options[correct_index],
                "explanation": "This option is taken from the uploaded document.",
            }
        )

    return {"questions": questions}


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

    try:
        raw = _call_groq(prompt)
        data = _extract_json_object(raw)
        if isinstance(data, dict):
            topics = data.get("topics", [])
            key_terms = data.get("key_terms", [])
            return {
                "summary": data.get("summary", ""),
                "topics": topics[:6],
                "key_terms": key_terms[:8],
                "stats": {
                    "pages": page_count,
                    "topics": len(topics),
                    "terms": len(key_terms),
                },
            }
    except Exception:
        pass

    return _fallback_insights(full_text, page_count)


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

    try:
        raw = _call_groq(prompt)
        data = _extract_json_object(raw)
        if isinstance(data, dict) and "nodes" in data and "edges" in data:
            return data
    except Exception:
        pass

    return _fallback_mindmap(full_text)


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

    try:
        raw = _call_groq(prompt)
        quiz = _normalize_quiz(_extract_json_object(raw), num_questions)
        if quiz["questions"]:
            return quiz
    except Exception:
        pass

    return _fallback_quiz(full_text, num_questions)

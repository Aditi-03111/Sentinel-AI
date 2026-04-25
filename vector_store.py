import math
import re
from collections import Counter


_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")
_STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "was",
    "were",
    "with",
}

_documents = []
_document_freqs = Counter()


def _tokenize(text: str) -> list[str]:
    return [
        token
        for token in _TOKEN_RE.findall(text.lower())
        if len(token) > 2 and token not in _STOP_WORDS
    ]


def add_documents(docs):
    global _documents, _document_freqs

    _documents = []
    _document_freqs = Counter()

    for i, doc in enumerate(docs):
        text = doc.get("text", "")
        tokens = _tokenize(text)
        term_counts = Counter(tokens)

        _documents.append(
            {
                "id": f"id_{i}_{doc.get('page', i + 1)}",
                "text": text,
                "metadata": {"page": doc.get("page", i + 1)},
                "term_counts": term_counts,
                "length": max(1, sum(term_counts.values())),
            }
        )
        _document_freqs.update(term_counts.keys())


def _score_document(query_terms: Counter, document: dict) -> float:
    total_docs = max(1, len(_documents))
    score = 0.0

    for term, query_weight in query_terms.items():
        term_frequency = document["term_counts"].get(term, 0)
        if not term_frequency:
            continue

        inverse_document_frequency = math.log(
            (1 + total_docs) / (1 + _document_freqs[term])
        ) + 1
        normalized_frequency = term_frequency / document["length"]
        score += query_weight * normalized_frequency * inverse_document_frequency

    return score


def query_collection(query, n_results=3):
    if not _documents:
        return {"documents": [[]], "metadatas": [[]], "ids": [[]]}

    query_terms = Counter(_tokenize(query))
    ranked = []

    for document in _documents:
        score = _score_document(query_terms, document) if query_terms else 0.0
        ranked.append((score, document))

    ranked.sort(key=lambda item: item[0], reverse=True)
    top_matches = [document for score, document in ranked[:n_results] if score > 0]

    if not top_matches:
        top_matches = [document for _, document in ranked[:n_results]]

    return {
        "documents": [[document["text"] for document in top_matches]],
        "metadatas": [[document["metadata"] for document in top_matches]],
        "ids": [[document["id"] for document in top_matches]],
    }

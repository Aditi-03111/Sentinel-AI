import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Local embedding function using sentence-transformers (no Ollama needed)
# ---------------------------------------------------------------------------
_model = SentenceTransformer('all-MiniLM-L6-v2')


class LocalEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        return _model.encode(list(input)).tolist()


chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="sentinel_collection",
    embedding_function=LocalEmbeddingFunction()
)


def add_documents(docs):
    # Clear existing docs so re-uploads don't conflict
    try:
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass

    for i, doc in enumerate(docs):
        collection.add(
            documents=[doc["text"]],
            metadatas=[{"page": doc["page"]}],
            ids=[f"id_{i}_{doc['page']}"]
        )


def query_collection(query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

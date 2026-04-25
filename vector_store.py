import chromadb
from chromadb.utils import embedding_functions

# Uses onnxruntime-based MiniLM — no torch, ~50MB
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="sentinel_collection",
    embedding_function=embedding_fn
)


def add_documents(docs):
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
    return collection.query(query_texts=[query], n_results=n_results)

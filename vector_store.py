import chromadb
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2

# Lightweight ONNX-based embeddings — no torch, no GPU, ~30MB
embedding_fn = ONNXMiniLM_L6_V2()

chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="sentinel_collection",
    embedding_function=embedding_fn
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

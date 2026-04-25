from pypdf import PdfReader


def extract_text_from_pdf(file_path: str):
    reader = PdfReader(file_path)
    documents = []

    for page_number, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            documents.append({
                "text": text,
                "page": page_number + 1
            })

    return documents

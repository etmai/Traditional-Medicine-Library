from pathlib import Path
from pypdf import PdfReader


PDF_DIR = Path(".source-pdfs")


def sample_text_lengths(reader, sample_pages=8):
    lengths = []
    for index in range(min(sample_pages, len(reader.pages))):
        text = reader.pages[index].extract_text() or ""
        lengths.append(len(text.strip()))
    return lengths


def main():
    if not PDF_DIR.exists():
        raise SystemExit("Missing .source-pdfs directory. Create hardlinks or copy PDFs there first.")

    for pdf_path in sorted(PDF_DIR.glob("*.pdf")):
        reader = PdfReader(str(pdf_path))
        lengths = sample_text_lengths(reader)
        has_text = any(length > 80 for length in lengths)
        status = "text-layer-ok" if has_text else "scan-needs-ocr"
        print(f"{pdf_path.name}\tpages={len(reader.pages)}\tstatus={status}\tsample_lengths={lengths}")


if __name__ == "__main__":
    main()

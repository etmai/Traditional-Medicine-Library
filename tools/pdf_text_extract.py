import argparse
from pathlib import Path

from pypdf import PdfReader


def parse_range(value):
    if not value:
        return None
    if "-" in value:
        start, end = value.split("-", 1)
        return int(start), int(end)
    page = int(value)
    return page, page


def main():
    parser = argparse.ArgumentParser(description="Extract embedded text from a PDF page range.")
    parser.add_argument("pdf", help="Path to a PDF file")
    parser.add_argument("--pages", help="1-based page range, for example 10-25")
    parser.add_argument("--out", help="Output text file")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    reader = PdfReader(str(pdf_path))
    page_range = parse_range(args.pages) or (1, len(reader.pages))
    start, end = page_range

    chunks = []
    for page_number in range(start, min(end, len(reader.pages)) + 1):
        text = reader.pages[page_number - 1].extract_text() or ""
        chunks.append(f"\\n\\n--- page {page_number} ---\\n{text.strip()}\\n")

    output = "".join(chunks).strip()
    if args.out:
        Path(args.out).write_text(output, encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()

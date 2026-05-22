import argparse
from pathlib import Path

from pypdf import PdfReader


def main():
    parser = argparse.ArgumentParser(description="Extract PDF page images from scan-based PDFs.")
    parser.add_argument("pdf", help="Path to the PDF")
    parser.add_argument("--start", type=int, required=True, help="1-based start page")
    parser.add_argument("--end", type=int, required=True, help="1-based end page")
    parser.add_argument("--out", default="extracted-pages", help="Output directory")
    parser.add_argument("--prefix", default="page", help="Output filename prefix")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(args.pdf)
    for page_number in range(args.start, min(args.end, len(reader.pages)) + 1):
      page = reader.pages[page_number - 1]
      if not page.images:
          print(f"page {page_number}: no embedded image")
          continue
      image = page.images[0].image.convert("RGB")
      out_path = out_dir / f"{args.prefix}-{page_number}.png"
      image.save(out_path)
      print(f"{page_number}\t{out_path}\t{image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()

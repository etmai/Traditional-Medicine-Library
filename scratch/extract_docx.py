import zipfile
import xml.etree.ElementTree as ET
import os

def docx_to_txt(docx_path, txt_path):
    with zipfile.ZipFile(docx_path) as docx:
        tree = ET.parse(docx.open('word/document.xml'))
        root = tree.getroot()
        paragraphs = []
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = []
            for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if run.text:
                    texts.append(run.text)
            paragraphs.append("".join(texts))
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(paragraphs))

docx_to_txt('Chi Tiet Ten-p4.docx', 'scratch/extracted_p4.txt')
print("Extracted text successfully!")

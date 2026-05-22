import re
content = open("scratch/extracted_p4.txt", encoding="utf-8").read()
lines = content.splitlines()
headings = []
for i, l in enumerate(lines):
    m = re.match(r"^(\d+)\.\s+(.*)", l.strip())
    if m:
        headings.append(f"{i}: {m.group(1)}. {m.group(2)}")
open("scratch/herbs_list.txt", "w", encoding="utf-8").write("\n".join(headings) + "\n")
print("Done")

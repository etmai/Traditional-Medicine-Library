import re
import json
import os

def slugify(text):
    co_dau = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"
    khong_dau = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd"
    char_map = dict(zip(co_dau, khong_dau))
    text = re.sub(r'\(.*?\)', '', text)
    text = text.lower().strip()
    res = []
    for c in text:
        if c in char_map:
            res.append(char_map[c])
        elif c.isalnum() or c == ' ':
            res.append(c)
        elif c == '-':
            res.append('-')
    cleaned = "".join(res)
    cleaned = re.sub(r'\s+', '-', cleaned)
    cleaned = re.sub(r'-+', '-', cleaned)
    return cleaned.strip('-')

def extract_use_cases(category, usage_summary, detailed_usage):
    text_to_search = (category + " " + usage_summary + " " + detailed_usage).lower()
    cases = []
    if any(k in text_to_search for k in ["bồi bổ", "bổ khí", "bổ huyết", "tư âm", "tráng dương", "suy nhược", "ích khí", "kiện tỳ", "bổ thận", "cơ thể suy nhược", "sinh huyết", "ích tinh", "noãn thận", "ôn tỳ"]):
        cases.append("tonic")
    if any(k in text_to_search for k in ["cảm mạo", "phong hàn", "phong nhiệt", "giải biểu", "phát hãn", "phát tán", "trị sốt", "sốt cao", "cúm", "viêm đường hô hấp", "ho gió", "ho khan"]):
        cases.append("cold")
    if any(k in text_to_search for k in ["hãm trà", "pha trà", "hãm uống", "uống thay trà", "nước mát", "chè", "thay trà", "thay chè"]):
        cases.append("tea")
    if any(k in text_to_search for k in ["tiêu hóa", "tỳ vị", "kiện tỳ", "tiêu thực", "đầy bụng", "chướng khí", "ăn kém", "tiêu chảy", "táo bón", "kiết lỵ", "nhuận tràng", "ăn uống kém tiêu", "ăn không tiêu", "nôn mửa", "kiện vị", "tả lỵ"]):
        cases.append("digestion")
    if any(k in text_to_search for k in ["kinh nguyệt", "phụ khoa", "đau bụng kinh", "rong kinh", "bế kinh", "sản hậu", "khí hư", "bạch đới", "kinh nguyệt không đều", "động thai", "sản hậu ứ huyết", "lợi sữa", "thông sữa"]):
        cases.append("women")
    if any(k in text_to_search for k in ["thanh nhiệt", "giải độc", "tiêu viêm", "lợi niệu", "mụn nhọt", "lở loét", "thũng", "mẩn ngứa", "rắn cắn", "tiêu độc", "thông lâm", "đái buốt", "đái rắt", "đái đục", "tiểu tiện bất lợi", "viêm gan", "vàng da"]):
        cases.append("detox")
    if any(k in text_to_search for k in ["an thần", "giấc ngủ", "mất ngủ", "dưỡng tâm", "định thần", "tâm thần bất an", "thần trí bất an", "khó ngủ", "kinh giật", "co giật trẻ em"]):
        cases.append("sleep")
    if any(k in text_to_search for k in ["xương khớp", "thấp khớp", "tê bại", "đau khớp", "gân xương", "khu phong", "trừ thấp", "tê thấp", "đau lưng mỏi gối", "chấn thương bầm tím", "tê liệt", "đau nhức xương"]):
        cases.append("joint")
    return list(set(cases))

def parse_docx_text(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()
    herbs = []
    current_heading = None
    current_body = []
    for line in lines:
        line_str = line.strip()
        match = re.match(r'^(\d+)\.\s+(.*)', line_str)
        if match:
            if current_heading:
                herbs.append((current_heading, current_body))
            current_heading = line_str
            current_body = []
        else:
            if current_heading:
                current_body.append(line)
    if current_heading:
        herbs.append((current_heading, current_body))
    parsed_herbs = []
    unsplash_images = [
        'https://images.unsplash.com/photo-1596431980838-89c0a1de43bb?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596715364530-811d9a924469?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606761560479-6646bc9b48f6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604116518178-57788ef57c09?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1603431777007-61db5b54636b?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1609601088069-36792f738d8a?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?q=80&w=800&auto=format&fit=crop'
    ]
    for heading, body_lines in herbs:
        heading_clean = heading.strip()
        match = re.match(r'^(\d+)\.\s*(.*)', heading_clean)
        if not match:
            continue
        num_str = match.group(1)
        full_title = match.group(2).strip()
        is_toxic_heading = False
        if any(w in full_title for w in ["⚠️ CỰC ĐỘC", "⚠️ CÓ ĐỘC", "⚠️ CÓ ĐỘC TÍNH"]):
            is_toxic_heading = True
            full_title = re.sub(r'⚠️\s*(CỰC ĐỘC|CÓ ĐỘC TÍNH|CÓ ĐỘC|ĐỘNG VẬT.*|CÓ ĐỘC TÍNH NHẸ|CÓ ĐỘC NHẸ)', '', full_title).strip()
        name_vn = full_title
        synonyms = ""
        paren_match = re.search(r'\(([^)]+)\)', full_title)
        if paren_match:
            synonyms = paren_match.group(1).strip()
            name_vn = re.sub(r'\([^)]+\)', '', full_title).strip()
        body_text = "\n".join(body_lines).strip()
        prefixes = [
            "Tên khoa học:", "Họ:", "Nhóm:", "Tính:", "Vị:", "Quy kinh:", "Bộ phận dùng:",
            "Công dụng:", "Cách bào chế:", "Phối hợp:", "Cần thận trọng:", "Liều dùng:", "⚠️ LƯU Ý:"
        ]
        matches = []
        for prefix in prefixes:
            idx = body_text.find(prefix)
            if idx != -1:
                matches.append((idx, prefix))
        matches.sort(key=lambda x: x[0])
        fields = {}
        for i, (idx, prefix) in enumerate(matches):
            start_val = idx + len(prefix)
            if i + 1 < len(matches):
                end_val = matches[i+1][0]
                val = body_text[start_val:end_val].strip()
            else:
                val = body_text[start_val:].strip()
            fields[prefix] = val
        scientific_name = fields.get("Tên khoa học:", "")
        family = fields.get("Họ:", "")
        category = fields.get("Nhóm:", "")
        properties = fields.get("Tính:", "")
        taste = fields.get("Vị:", "")
        meridians = fields.get("Quy kinh:", "")
        part_used = fields.get("Bộ phận dùng:", "")
        cong_dung_raw = fields.get("Công dụng:", "")
        usage_summary = cong_dung_raw
        detailed_usage = ""
        tri_match = re.search(r'\b(Trị|Hỗ trợ trị)\b', cong_dung_raw, re.IGNORECASE)
        if tri_match:
            idx_tri = tri_match.start()
            usage_summary = cong_dung_raw[:idx_tri].strip().rstrip('.')
            detailed_usage = cong_dung_raw[idx_tri:].strip()
        preparation = fields.get("Cách bào chế:", "")
        tcm_preparation = preparation
        dosage = fields.get("Liều dùng:", "")
        warnings = fields.get("Cần thận trọng:", "")
        luu_y = fields.get("⚠️ LƯU Ý:", "")
        basic_summary_parts = []
        if luu_y:
            basic_summary_parts.append(f"Lưu ý: {luu_y}")
        if synonyms:
            basic_summary_parts.append(f"Còn gọi là: {synonyms}.")
        basic_summary = " ".join(basic_summary_parts)
        combos_raw = fields.get("Phối hợp:", "")
        combinations_list = []
        if combos_raw:
            for combo_line in combos_raw.splitlines():
                combo_line = combo_line.strip()
                if not combo_line:
                    continue
                if ":" in combo_line:
                    left, right = combo_line.split(":", 1)
                    left = left.strip()
                    right = right.strip()
                    if right.lower().startswith("phối "):
                        right = right[5:].strip()
                    combinations_list.append({
                        "name": right,
                        "type": "Phối hợp",
                        "note": f"Trị {left.lower()}"
                    })
                else:
                    combinations_list.append({
                        "name": combo_line,
                        "type": "Phối hợp",
                        "note": "Kinh nghiệm phối hợp trị bệnh"
                    })
        safety_level = "normal"
        text_for_safety = f"{heading} {warnings} {properties}".lower()
        if is_toxic_heading or any(k in text_for_safety for k in ["cực độc", "có độc tính", "có độc nhẹ", "độc tính", "có độc", "tẩy giun mạnh"]):
            safety_level = "toxic"
        elif any(k in text_for_safety for k in ["thận trọng", "cấm dùng", "không dùng", "tương phản", "tương khắc", "lưu ý", "⚠️"]):
            safety_level = "caution"
        use_cases = extract_use_cases(category, usage_summary + " " + detailed_usage, detailed_usage)
        slug = slugify(name_vn)
        image_url = unsplash_images[abs(hash(slug)) % len(unsplash_images)]
        parsed_herbs.append({
            "slug": slug,
            "name_vn": name_vn,
            "name_han": "",
            "scientific_name": scientific_name,
            "family": family,
            "category": category,
            "part_used": part_used,
            "properties": properties,
            "taste": taste,
            "meridians": meridians,
            "use_cases": use_cases,
            "usage_summary": usage_summary,
            "basic_summary": basic_summary,
            "detailed_usage": detailed_usage,
            "preparation": preparation,
            "tcm_preparation": tcm_preparation,
            "dosage": dosage,
            "warnings": warnings,
            "safety_level": safety_level,
            "is_toxic": (safety_level == "toxic"),
            "image": image_url,
            "tags": [category] if category else [],
            "source_refs": [{"label": "Docx - Chi Tiet Ten-p4", "url": ""}],
            "combinations": combinations_list
        })
    return parsed_herbs

extracted = parse_docx_text('scratch/extracted_p4.txt')
print(f"Successfully extracted {len(extracted)} herbs.")
with open('scratch/extracted_herbs_p4.json', 'w', encoding='utf-8') as f:
    json.dump(extracted, f, ensure_ascii=False, indent=2)
print("Saved to scratch/extracted_herbs_p4.json.")
print("First herb check:")
print(json.dumps(extracted[0] if extracted else {}, ensure_ascii=False, indent=2))

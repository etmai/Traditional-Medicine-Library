const fs = require('fs');

const text = fs.readFileSync('scratch/pdf2_text.txt', 'utf-8');
const lines = text.split('\n').map(l => l.trim());

const parsedHerbs = [];
let currentHerb = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Detect new herb: e.g. "7. Cù đèn (Chổi tua / Bìm bịp gai / Giác cườm)"
    // or "10. Cun chó (Cù đen / Chó đẻ / Đơn cún)"
    const matchName = line.match(/^(\d+)\.\s+([^(]+)(?:\(([^)]+)\))?/);
    if (matchName && !line.includes('Ghi chú')) {
        if (currentHerb) {
            parsedHerbs.push(currentHerb);
        }
        currentHerb = {
            name_vn: matchName[2].trim(),
            name_han: "", // Try to find if provided
            slug: matchName[2].trim().toLowerCase().replace(/ đ/g, ' d').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'),
            scientific_name: "",
            family: "",
            category: "",
            properties: "",
            taste: "",
            meridians: "",
            part_used: "",
            usage_summary: "",
            basic_summary: "",
            detailed_usage: "",
            preparation: "",
            warnings: "",
            dosage: "",
            tags: [],
            is_toxic: false,
            safety_level: "normal",
        };
        const altNames = matchName[3] ? matchName[3].trim() : "";
        if (altNames) {
            currentHerb.basic_summary = `Còn gọi là: ${altNames}.`;
        }
        continue;
    }

    if (!currentHerb) continue;

    if (line.includes('CÓ ĐỘC') || line.includes('CẢNH BÁO ĐỘC TÍNH')) {
        currentHerb.is_toxic = true;
        currentHerb.safety_level = "toxic";
    }

    if (line.startsWith('• Tên khoa học:')) {
        currentHerb.scientific_name = line.replace('• Tên khoa học:', '').trim();
    } else if (line.startsWith('• Họ:')) {
        currentHerb.family = line.replace('• Họ:', '').trim();
    } else if (line.startsWith('• Nhóm:')) {
        currentHerb.category = line.replace('• Nhóm:', '').trim();
    } else if (line.startsWith('• Tính:')) {
        currentHerb.properties = line.replace('• Tính:', '').trim();
    } else if (line.startsWith('• Vị:')) {
        currentHerb.taste = line.replace('• Vị:', '').trim();
    } else if (line.startsWith('• Quy kinh:')) {
        currentHerb.meridians = line.replace('• Quy kinh:', '').trim();
    } else if (line.startsWith('• Bộ phận dùng:')) {
        currentHerb.part_used = line.replace('• Bộ phận dùng:', '').trim();
    } else if (line.startsWith('• Công dụng:')) {
        let usage = line.replace('• Công dụng:', '').trim();
        // Read next lines if they don't start with bullet point
        let j = i + 1;
        while (j < lines.length && lines[j] && !lines[j].startsWith('•')) {
            usage += ' ' + lines[j];
            j++;
        }
        i = j - 1;
        currentHerb.detailed_usage = usage;
        const parts = usage.split('. Trị ');
        if (parts.length > 1) {
            currentHerb.usage_summary = parts[0] + '.';
            currentHerb.detailed_usage = 'Trị ' + parts[1];
        } else {
            currentHerb.usage_summary = usage;
        }
    } else if (line.startsWith('• Cách bào chế:')) {
        let prep = line.replace('• Cách bào chế:', '').trim();
        let j = i + 1;
        while (j < lines.length && lines[j] && !lines[j].startsWith('•')) {
            prep += ' ' + lines[j];
            j++;
        }
        i = j - 1;
        currentHerb.preparation = prep;
    } else if (line.startsWith('• Cần thận trọng:')) {
        let warn = line.replace('• Cần thận trọng:', '').trim();
        let j = i + 1;
        while (j < lines.length && lines[j] && !lines[j].startsWith('•')) {
            warn += ' ' + lines[j];
            j++;
        }
        i = j - 1;
        currentHerb.warnings = warn;
    } else if (line.startsWith('• Liều dùng:')) {
        currentHerb.dosage = line.replace('• Liều dùng:', '').trim();
    }
}
if (currentHerb) {
    parsedHerbs.push(currentHerb);
}

// Filter out the ones already manually added or duplicates
const existingSlugs = ["cu-kim-cang", "hoai-son", "cu-nau", "cat-can", "cu-sung", "cuc-ao", "cuc-hoa-vang", "cuc-hoa-trang", "cuc-moc", "cuc-tan", "cuc-tru-sau", "la-bac-tu", "cu-nhan-sam"];

const newHerbs = parsedHerbs.filter(h => h.name_vn && h.scientific_name && !existingSlugs.includes(h.slug) && !existingSlugs.some(slug => h.slug.includes(slug)));

// Deduplicate
const uniqueHerbsMap = {};
for (const herb of newHerbs) {
    uniqueHerbsMap[herb.slug] = herb;
}
const finalHerbs = Object.values(uniqueHerbsMap);

let codeToAppend = "";
let startIndex = 440;

for (const herb of finalHerbs) {
    // Escape quotes
    const cleanStr = (str) => (str || "").replace(/"/g, '\\"');
    
    codeToAppend += `  , {
    id: ${startIndex++},
    slug: "${cleanStr(herb.slug)}",
    name_vn: "${cleanStr(herb.name_vn)}",
    name_han: "${cleanStr(herb.name_han)}",
    scientific_name: "${cleanStr(herb.scientific_name)}",
    family: "${cleanStr(herb.family)}",
    category: "${cleanStr(herb.category)}",
    part_used: "${cleanStr(herb.part_used)}",
    properties: "${cleanStr(herb.properties)}",
    taste: "${cleanStr(herb.taste)}",
    meridians: "${cleanStr(herb.meridians)}",
    use_cases: [],
    usage_summary: "${cleanStr(herb.usage_summary)}",
    basic_summary: "${cleanStr(herb.basic_summary)}",
    detailed_usage: "${cleanStr(herb.detailed_usage)}",
    preparation: "${cleanStr(herb.preparation)}",
    dosage: "${cleanStr(herb.dosage)}",
    warnings: "${cleanStr(herb.warnings)}",
    safety_level: "${cleanStr(herb.safety_level)}",
    is_toxic: ${herb.is_toxic},
    image: "https://images.unsplash.com/photo-1596431980838-89c0a1de43bb?q=80&w=800&auto=format&fit=crop",
    tags: [],
    source_refs: [{ label: "PDF - Chi Tiet Ten-p2", url: "" }],
    combinations: []
  }\n`;
}

if (finalHerbs.length > 0) {
    let herbsCode = fs.readFileSync('src/data/herbs.js', 'utf-8');
    herbsCode = herbsCode.replace(/\n];\s*$/, '\\n' + codeToAppend.replace(/\\n/g, '\n') + '\n];\n');
    fs.writeFileSync('src/data/herbs.js', herbsCode);
    console.log('Appended ' + finalHerbs.length + ' herbs!');
} else {
    console.log('No new herbs to append.');
}

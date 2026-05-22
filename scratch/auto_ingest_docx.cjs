const fs = require('fs');
const mammoth = require('mammoth');

async function processDocx(filePath) {
    console.log('Reading ' + filePath + '...');
    try {
        const result = await mammoth.extractRawText({path: filePath});
        const text = result.value;
        const lines = text.split('\n').map(l => l.trim());

        const parsedHerbs = [];
        let currentHerb = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;

            const matchName = line.match(/^(\d+)\.\s+([^(]+)(?:\(([^)]+)\))?/);
            if (matchName && !line.includes('Ghi chú')) {
                if (currentHerb) {
                    parsedHerbs.push(currentHerb);
                }
                currentHerb = {
                    name_vn: matchName[2].trim(),
                    name_han: "", 
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

            if (line.startsWith('Tên khoa học:')) {
                currentHerb.scientific_name = line.replace('Tên khoa học:', '').trim();
            } else if (line.startsWith('Họ:')) {
                currentHerb.family = line.replace('Họ:', '').trim();
            } else if (line.startsWith('Nhóm:')) {
                currentHerb.category = line.replace('Nhóm:', '').trim();
            } else if (line.startsWith('Tính:')) {
                currentHerb.properties = line.replace('Tính:', '').trim();
            } else if (line.startsWith('Vị:')) {
                currentHerb.taste = line.replace('Vị:', '').trim();
            } else if (line.startsWith('Quy kinh:')) {
                currentHerb.meridians = line.replace('Quy kinh:', '').trim();
            } else if (line.startsWith('Bộ phận dùng:')) {
                currentHerb.part_used = line.replace('Bộ phận dùng:', '').trim();
            } else if (line.startsWith('Công dụng:')) {
                let usage = line.replace('Công dụng:', '').trim();
                let j = i + 1;
                while (j < lines.length && lines[j] && !/^(Tên khoa học|Họ|Nhóm|Tính|Vị|Quy kinh|Bộ phận dùng|Công dụng|Cách bào chế|Cần thận trọng|Liều dùng):/.test(lines[j]) && !/^(\d+)\.\s+/.test(lines[j])) {
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
            } else if (line.startsWith('Cách bào chế:')) {
                let prep = line.replace('Cách bào chế:', '').trim();
                let j = i + 1;
                while (j < lines.length && lines[j] && !/^(Tên khoa học|Họ|Nhóm|Tính|Vị|Quy kinh|Bộ phận dùng|Công dụng|Cách bào chế|Cần thận trọng|Liều dùng):/.test(lines[j]) && !/^(\d+)\.\s+/.test(lines[j])) {
                    prep += ' ' + lines[j];
                    j++;
                }
                i = j - 1;
                currentHerb.preparation = prep;
            } else if (line.startsWith('Cần thận trọng:')) {
                let warn = line.replace('Cần thận trọng:', '').trim();
                let j = i + 1;
                while (j < lines.length && lines[j] && !/^(Tên khoa học|Họ|Nhóm|Tính|Vị|Quy kinh|Bộ phận dùng|Công dụng|Cách bào chế|Cần thận trọng|Liều dùng):/.test(lines[j]) && !/^(\d+)\.\s+/.test(lines[j])) {
                    warn += ' ' + lines[j];
                    j++;
                }
                i = j - 1;
                currentHerb.warnings = warn;
            } else if (line.startsWith('Liều dùng:')) {
                currentHerb.dosage = line.replace('Liều dùng:', '').trim();
            }
        }
        if (currentHerb) {
            parsedHerbs.push(currentHerb);
        }

        // Read existing slugs
        let herbsCode = fs.readFileSync('src/data/herbs.js', 'utf-8');
        const slugRegex = /slug:\s*"([^"]+)"/g;
        let match;
        const existingSlugs = new Set();
        while ((match = slugRegex.exec(herbsCode)) !== null) {
            existingSlugs.add(match[1]);
        }

        // Check the max id in existing herbs to start auto-increment
        const idRegex = /id:\s*(\d+)/g;
        let maxId = 0;
        let idMatch;
        while ((idMatch = idRegex.exec(herbsCode)) !== null) {
            const id = parseInt(idMatch[1], 10);
            if (id > maxId) maxId = id;
        }

        const newHerbs = parsedHerbs.filter(h => h.name_vn && h.scientific_name && !existingSlugs.has(h.slug) && h.slug.length > 0);

        // Deduplicate locally in doc
        const uniqueHerbsMap = {};
        for (const herb of newHerbs) {
            uniqueHerbsMap[herb.slug] = herb;
        }
        const finalHerbs = Object.values(uniqueHerbsMap);

        let codeToAppend = "";
        let startIndex = maxId + 1;

        for (const herb of finalHerbs) {
            const cleanStr = (str) => (str || "").replace(/"/g, '\\"');
            
            codeToAppend += `  }, {\n    id: ${startIndex++},\n    slug: "${cleanStr(herb.slug)}",\n    name_vn: "${cleanStr(herb.name_vn)}",\n    name_han: "${cleanStr(herb.name_han)}",\n    scientific_name: "${cleanStr(herb.scientific_name)}",\n    family: "${cleanStr(herb.family)}",\n    category: "${cleanStr(herb.category)}",\n    part_used: "${cleanStr(herb.part_used)}",\n    properties: "${cleanStr(herb.properties)}",\n    taste: "${cleanStr(herb.taste)}",\n    meridians: "${cleanStr(herb.meridians)}",\n    use_cases: [],\n    usage_summary: "${cleanStr(herb.usage_summary)}",\n    basic_summary: "${cleanStr(herb.basic_summary)}",\n    detailed_usage: "${cleanStr(herb.detailed_usage)}",\n    preparation: "${cleanStr(herb.preparation)}",\n    dosage: "${cleanStr(herb.dosage)}",\n    warnings: "${cleanStr(herb.warnings)}",\n    safety_level: "${cleanStr(herb.safety_level)}",\n    is_toxic: ${herb.is_toxic},\n    image: "https://images.unsplash.com/photo-1596431980838-89c0a1de43bb?q=80&w=800&auto=format&fit=crop",\n    tags: [],\n    source_refs: [{ label: "Docx - Chi Tiet Ten-p3", url: "" }],\n    combinations: []\n`;
        }

        if (finalHerbs.length > 0) {
            herbsCode = herbsCode.replace(/}[\s\n]*];[\s\n]*$/, codeToAppend + '  }\n];\n');
            fs.writeFileSync('src/data/herbs.js', herbsCode);
            console.log('Appended ' + finalHerbs.length + ' herbs!');
        } else {
            console.log('No new herbs to append.');
        }

    } catch (e) {
        console.error(e);
    }
}

processDocx('C:/Users/maihu/.gemini/antigravity/playground/celestial-ring/Chi Tiet Ten-p3.docx');

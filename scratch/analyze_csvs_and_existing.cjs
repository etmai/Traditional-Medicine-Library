const fs = require('fs');
const path = require('path');

// Load parsed CSV data
const parsedData = require('./parsed_data.json');

// Let's import the current prescriptions (we will read it as string and evaluate or use regex/json if possible, or just require)
// Wait, prescriptions.js is ES module, so we can't require it directly. Let's read it and parse or use dynamic import in an async function.
async function run() {
  const prescriptionsModule = await import('../src/data/prescriptions.js');
  const existing = prescriptionsModule.prescriptions;
  
  console.log('Existing prescriptions count:', existing.length);
  const existingNames = new Set(existing.map(p => p.name.trim().toLowerCase()));
  
  // Collect all prescriptions from CSVs
  const csvPrescriptions = [];
  
  for (const [filename, fileData] of Object.entries(parsedData)) {
    const isNamDuoc = filename.includes('Nam Dược');
    const isHaiThuong = filename.includes('Hải Thượng');
    const groupName = filename.replace('.csv', '');
    
    fileData.rows.forEach((row, idx) => {
      if (isNamDuoc) {
        // Header: [ 'Bệnh/Chứng', 'Tên bài thuốc (dân gian)', 'Thành phần chính (ví dụ)' ]
        const [symptom, name, ingredientsStr] = row;
        if (!name) return;
        csvPrescriptions.push({
          name: name.trim(),
          source: 'Nam Dược Thần Hiệu',
          category: 'Nam dược dân gian',
          usage: 'Trị ' + symptom.toLowerCase(),
          indications: 'Chỉ trị chứng: ' + symptom,
          ingredientsStr,
          rawRow: row,
          groupName,
          filename
        });
      } else if (isHaiThuong) {
        // Header: [ 'Tên bài thuốc', 'Công dụng chính', 'Ghi chú' ]
        const [name, usage, notes] = row;
        if (!name) return;
        csvPrescriptions.push({
          name: name.trim(),
          source: 'Hải Thượng Y Tông Tâm Lĩnh',
          category: 'Y Tông Tâm Lĩnh',
          usage: usage,
          indications: notes || 'Ghi chú cổ truyền',
          ingredientsStr: '',
          rawRow: row,
          groupName,
          filename
        });
      } else {
        // Group CSV
        // Header: [ 'Tên bài thuốc', 'Xuất xứ', 'Thành phần chính', 'Công dụng chính' ]
        const [name, source, ingredientsStr, usage] = row;
        if (!name) return;
        csvPrescriptions.push({
          name: name.trim(),
          source: source || 'Cổ phương',
          category: groupName,
          usage: usage,
          indications: 'Trị các chứng thuộc nhóm ' + groupName.toLowerCase(),
          ingredientsStr,
          rawRow: row,
          groupName,
          filename
        });
      }
    });
  }
  
  console.log('Total prescriptions in CSVs:', csvPrescriptions.length);
  
  const notInExisting = [];
  const inExisting = [];
  
  csvPrescriptions.forEach(p => {
    if (existingNames.has(p.name.toLowerCase())) {
      inExisting.push(p);
    } else {
      notInExisting.push(p);
    }
  });
  
  console.log('\nPrescriptions already in src/data/prescriptions.js (Count: ' + inExisting.length + '):');
  inExisting.forEach(p => console.log('- ' + p.name + ' (Group: ' + p.groupName + ')'));
  
  console.log('\nPrescriptions NOT in src/data/prescriptions.js (Count: ' + notInExisting.length + '):');
  notInExisting.forEach(p => console.log('- ' + p.name + ' (Group: ' + p.groupName + ', Source: ' + p.source + ')'));
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BRAIN_DIR = 'C:\\Users\\maihu\\.gemini\\antigravity\\brain\\e4fa7177-19fc-470d-9ec7-f68077ee6ac2';
const IMAGES_DIR = path.resolve(__dirname, '../public/images');
const PROMPTS_PATH = 'C:\\Users\\maihu\\.gemini\\antigravity\\scratch\\prompts_utf8.json';

if (!fs.existsSync(PROMPTS_PATH)) {
  console.error('Cannot find prompts_utf8.json');
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));

console.log(`Loaded ${batch.length} herbs from prompts list.`);

batch.forEach(herb => {
  const prefix = herb.slug.replace(/-/g, '_');
  const files = fs.readdirSync(BRAIN_DIR);
  
  // Find files matching prefix exactly or prefix_timestamp
  const matchingFiles = files.filter(f => {
    if (!f.endsWith('.png')) return false;
    const base = f.slice(0, -4);
    if (base === prefix) return true;
    if (base.startsWith(prefix + '_')) {
      const rest = base.substring(prefix.length + 1);
      return /^\d+$/.test(rest);
    }
    return false;
  });
  if (matchingFiles.length === 0) {
    console.log(`No PNG found for slug: ${herb.slug} (prefix: ${prefix})`);
    return;
  }
  
  // Get the latest file by modification time
  const latestFile = matchingFiles.map(f => {
    const filePath = path.join(BRAIN_DIR, f);
    return { name: f, path: filePath, mtime: fs.statSync(filePath).mtime };
  }).sort((a, b) => b.mtime - a.mtime)[0];
  
  const destJpg = path.join(IMAGES_DIR, `${herb.slug}.jpg`);
  
  console.log(`Converting latest PNG for ${herb.slug}: ${latestFile.name} -> ${herb.slug}.jpg`);
  
  try {
    // Run PowerShell command to convert
    const psCmd = `Add-Type -AssemblyName System.Drawing; [System.Drawing.Image]::FromFile('${latestFile.path.replace(/'/g, "''")}').Save('${destJpg.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Jpeg)`;
    execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });
    console.log(`Successfully converted ${herb.slug}`);
  } catch (err) {
    console.error(`Error converting ${herb.slug}:`, err.message);
  }
});

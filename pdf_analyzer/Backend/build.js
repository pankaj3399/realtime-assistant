import { readFileSync, writeFileSync } from 'fs';
const dir = 'node_modules/pdf.js-extract/lib/pdfjs/pdf.js';
const content = readFileSync(dir, { encoding: 'utf-8' });
writeFileSync(dir, content.replace('"./pdf.worker.js";', `__dirname + "/pdf.worker.js";`))
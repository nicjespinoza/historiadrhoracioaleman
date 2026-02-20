
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    'wix_pacientes.json',
    'wix_historias.json',
    'wix_seguimientos.json',
    'wix_recetas.json'
];

console.log('--- Record Counts ---');

for (const file of files) {
    const filePath = path.join(__dirname, 'data', file);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        const count = Array.isArray(json) ? json.length : Object.keys(json).length;
        console.log(`${file}: ${count} records`);

        if (file === 'wix_pacientes.json') {
            // Check how many have idunico
            const patients = Array.isArray(json) ? json : Object.values(json);
            const withId = patients.filter(p => p.idunico);
            console.log(`  -> Patients with idunico: ${withId.length}`);
            const withoutId = patients.filter(p => !p.idunico);
            console.log(`  -> Patients WITHOUT idunico: ${withoutId.length}`);
        }
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
}

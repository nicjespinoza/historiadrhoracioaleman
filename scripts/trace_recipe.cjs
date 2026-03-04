const fs = require('fs');
const path = require('path');
const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_recetas.json'), 'utf8'));
const patients = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'wix_pacientes.json'), 'utf8'));

const r = recipes.find(r => r.Generatedid === 'HI49391');
if (r) {
    console.log('Recipe HI49391 found.');
    console.log('Recipe Idunico (Patient Wix ID):', r.Idunico);
    const p = patients.find(p => p.idunico === r.Idunico || p.ID === r.Idunico);
    if (p) {
        console.log('Patient found:', p.Nombre, p.Apellidos);
        console.log('Patient Firestore ID candidate (Wix ID):', p.ID);
    } else {
        console.log('Patient NOT found for Idunico:', r.Idunico);
    }
} else {
    console.log('Recipe HI49391 NOT found.');
}

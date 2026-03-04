const fs = require('fs');
const path = require('path');

const recipesFile = path.join(__dirname, 'data', 'wix_recetas.json');
const patientsFile = path.join(__dirname, 'data', 'wix_pacientes.json');

const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));
const patients = JSON.parse(fs.readFileSync(patientsFile, 'utf8'));

console.log('--- Search Results ---');

const findRecipe = (id) => recipes.filter(r =>
    r.Generatedid === id ||
    r.ID === id ||
    r.Idunico === id ||
    (r.Tipo && r.Tipo.includes(id))
);

const findPatient = (idOrName) => patients.filter(p =>
    p.ID === idOrName ||
    p.idunico === idOrName ||
    (p.Nombre && p.Nombre.includes(idOrName)) ||
    (p.Apellidos && p.Apellidos.includes(idOrName))
);

console.log('Recipe HI49391:', JSON.stringify(findRecipe('HI49391'), null, 2));
console.log('Patient e19b6c82-bee9-42df-9783-9bf5aa6ee304:', JSON.stringify(findPatient('e19b6c82-bee9-42df-9783-9bf5aa6ee304'), null, 2));
console.log('Patient 19b6c82-bee9-42df-9783-9bf5aa6ee304:', JSON.stringify(findPatient('19b6c82-bee9-42df-9783-9bf5aa6ee304'), null, 2));
console.log('Fabiola:', JSON.stringify(findPatient('Fabiola'), null, 2));

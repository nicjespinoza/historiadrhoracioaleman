const http = require('http');

const data = JSON.stringify({
    firstName: "Juan",
    lastName: "Perez",
    email: "juan@test.com",
    phone: "12345678",
    registrationSource: "manual",
    birthDate: "1990-01-01",
    ageDetails: "33",
    sex: "Masculino",
    profession: "Tester",
    address: "Test Address",
    initialReason: "Checkup"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/patients',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Middleware to check and set UUID cookie
app.use((req, res, next) => {
    if (!req.cookies.userUUID) {
        const userUUID = uuidv4();
        res.cookie('userUUID', userUUID, { maxAge: 900000, httpOnly: true });
    }
    next();
});

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Save data endpoint
app.post('/save', (req, res) => {
    const userUUID = req.cookies.userUUID;
    if (!userUUID) {
        return res.status(400).send('User UUID is missing.');
    }

    const dataName = req.body.name;
    const data = req.body.data;
    if (!dataName || !data) {
        return res.status(400).send('Name and data are required.');
    }

    const userDirectory = path.join(__dirname, 'data', userUUID);
    if (!fs.existsSync(userDirectory)) {
        fs.mkdirSync(userDirectory, { recursive: true });
    }

    const filePath = path.join(userDirectory, `${dataName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(200).send('Data saved successfully.');
});

// Retrieve list of saved data names
app.get('/retrieve', (req, res) => {
    const userUUID = req.cookies.userUUID;
    if (!userUUID) {
        return res.status(400).send('User UUID is missing.');
    }

    const userDirectory = path.join(__dirname, 'data', userUUID);
    if (!fs.existsSync(userDirectory)) {
        return res.status(200).json([]);
    }

    const files = fs.readdirSync(userDirectory).map(file => path.basename(file, '.json'));
    res.status(200).json(files);
});

// Retrieve specific data by name
app.get('/retrieve/:name', (req, res) => {
    const userUUID = req.cookies.userUUID;
    if (!userUUID) {
        return res.status(400).send('User UUID is missing.');
    }

    const dataName = req.params.name;
    const filePath = path.join(__dirname, 'data', userUUID, `${dataName}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Data not found.');
    }

    const data = fs.readFileSync(filePath);
    res.status(200).json(JSON.parse(data));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
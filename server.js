const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve the HTML file
app.use(express.static('public'));

// Endpoint to save JSON data
app.post('/save', (req, res) => {
    const data = req.body;
    const title = data.title.trim();
    const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${title}_${dateTime}.json`;
    const filePath = path.join(__dirname, 'public', filename);

    fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
        if (err) {
            return res.status(500).send('Failed to save data');
        }
        res.send({ filename });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
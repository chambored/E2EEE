/**
 * Name: Nick Trimmer
 * Date: 11/26/2023
 *
 * Description: This is the server side of the application. It is responsible for storing the encrypted data
 * in memory and serving the static files. It also provides two endpoints:
 * - POST /save: Saves the encrypted data in memory
 * - GET /load/:name: Loads the encrypted data from memory
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Store encrypted data
let documents = {};

// Save encrypted data
app.post('/save', (req, res) => {
    const { name, content } = req.body;
    if (!name || !content) {
        res.status(400).send('Missing name or content');
        return;
    }
    if (documents[name]) {
        res.status(409).send('Document already exists');
        return;
    }

    documents[name] = content;
    res.status(200).send('Document saved successfully');
});

// Load encrypted data
app.get('/load/:name', (req, res) => {
    const { name } = req.params;
    if (!documents[name]) {
        res.status(404).send('Document not found');
        return;
    }
    // Only send back the encrypted content
    res.status(200).json({ content: documents[name] });
    delete documents[name];
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
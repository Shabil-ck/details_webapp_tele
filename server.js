const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { spawn } = require('child_process'); // Import child_process module
const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(bodyParser.json({ limit: '50mb' }));

// Start the Python script continuously
let pythonProcess;

function startPythonScript() {
    console.log("Starting Python script: app.py...");
    pythonProcess = spawn('python', ['app.py']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        // Restart the Python script if it stops
        console.log("Restarting Python script...");
        startPythonScript();
    });
}

// POST route to save photo
app.post('/save-photo', (req, res) => {
    const photoData = req.body.photo;
    const base64Data = photoData.replace(/^data:image\/png;base64,/, "");

    // Save the photo in the current folder with a timestamped filename
    const filePath = path.join(__dirname, 'photo-' + Date.now() + '.png');
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving photo:', err);
            return res.status(500).send('Error saving photo');
        }
        res.json({ message: 'Photo saved successfully', filePath });
    });
});

// POST route to save details in details.txt
app.post('/save-details', (req, res) => {
    const details = req.body.details;

    // Save details to details.txt in the current folder
    const filePath = path.join(__dirname, 'details.txt');
    fs.writeFile(filePath, details, (err) => {
        if (err) {
            console.error('Error saving details:', err);
            return res.status(500).send('Error saving details');
        }
        res.json({ message: 'Details saved successfully', filePath });
    });
});

// Serve static files (like your HTML, CSS, etc.)
app.use(express.static(__dirname));

// Start the server and Python script
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startPythonScript(); // Start the Python script continuously
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log("Stopping server...");
    if (pythonProcess) {
        pythonProcess.kill(); // Terminate the Python script
        console.log("Python script stopped.");
    }
    process.exit();
});

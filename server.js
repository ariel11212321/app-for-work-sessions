const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');
const workSessionsFilePath = path.join(__dirname, 'work_sessions.json');

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.json());

// Route handler to handle the incoming work session data
app.post('/work-session', async (req, res) => {
    const { start_time, end_time, duration } = req.body;
    const newSession = {
        start_time,
        end_time,
        duration
    };

    try {
        // Read existing work sessions from the JSON file
        let workSessions = [];
        if (fs.existsSync(workSessionsFilePath)) {
            const fileData = fs.readFileSync(workSessionsFilePath, 'utf8');
            workSessions = JSON.parse(fileData);
        }

        // Add the new session to the existing work sessions
        workSessions.push(newSession);

        // Write updated work sessions back to the JSON file
        fs.writeFileSync(workSessionsFilePath, JSON.stringify(workSessions, null, 2));

        console.log('Data saved to JSON file.');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data to JSON file:', error);
        res.status(500).json({ error: 'An error occurred while saving data to the file.' });
    }
});

// Route handler to get all work session data from the JSON file
app.get('/work-sessions', async (req, res) => {
    try {
        // Read work sessions from the JSON file
        let workSessions = [];
        if (fs.existsSync(workSessionsFilePath)) {
            const fileData = fs.readFileSync(workSessionsFilePath, 'utf8');
            workSessions = JSON.parse(fileData);
        }

        res.json(workSessions);
    } catch (error) {
        console.error('Error fetching data from the JSON file:', error);
        res.status(500).json({ error: 'An error occurred while fetching data from the file.' });
    }
});

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory key storage (தாற்காலிகமாக சேமிக்க)
let keysDatabase = {};

// Serve Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login Check & Dashboard
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123') {
        res.send(`
            <html>
            <head>
                <title>Mic Power - Admin Dashboard</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #111;
                        color: #fff;
                        font-family: Arial, sans-serif;
                        background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent);
                        background-size: 50px 50px;
                    }
                    .container { width: 400px; margin: 50px auto; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; box-shadow: 0 0 10px #0ff; }
                    h2 { text-align: center; color: #0ff; }
                    input, button { width: 100%; padding: 10px; margin: 10px 0; background: #222; border: 1px solid #0ff; color: #fff; border-radius: 4px; }
                    button { background: #0ff; color: #000; font-weight: bold; cursor: pointer; }
                    .result { background: #222; padding: 10px; margin-top: 10px; word-break: break-all; border-left: 4px solid #0ff; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>MIC POWER - Key Generator</h2>
                    <form action="/generate" method="POST">
                        <label>Key Length (Digits):</label>
                        <input type="number" name="length" value="8" required>
                        <label>Expiry Date:</label>
                        <input type="date" name="expiry" required>
                        <button type="submit">Generate & Active Key</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send("<h3>Invalid Username or Password! <a href='/'>Back</a></h3>");
    }
});

// Generate Key Route
app.post('/generate', (req, res) => {
    const { length, expiry } = req.body;
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedKey = '';
    for (let i = 0; i < length; i++) {
        generatedKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Save key as active
    keysDatabase[generatedKey] = { expiry: expiry, active: true, usedBy: null };

    res.send(`
        <html>
        <head>
            <title>Key Generated</title>
            <style>
                body { margin: 0; padding: 0; background: #111; color: #fff; font-family: Arial, sans-serif; }
                .container { width: 400px; margin: 50px auto; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; box-shadow: 0 0 10px #0ff; text-align: center; }
                h2 { color: #0ff; }
                .key-box { background: #222; padding: 15px; font-size: 20px; color: #0f0; margin: 15px 0; border: 1px dashed #0f0; }
                a { color: #0ff; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Key Generated Successfully!</h2>
                <div class="key-box">${generatedKey}</div>
                <p>Expiry Date: ${expiry}</p>
                <p style="color: #0f0;">Status: Active</p>
                <br><a href="/">Generate Another Key</a>
            </div>
        </body>
        </html>
    `);
});

// API for Extension to Verify Key
app.post('/verify-key', (req, res) => {
    const { key, deviceId } = req.body;
    
    if (keysDatabase[key] && keysDatabase[key].active) {
        keysDatabase[key].usedBy = deviceId;
        res.json({ success: true, message: "One Key Activated!" });
    } else {
        res.json({ success: false, message: "Invalid or Inactive Key!" });
    }
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

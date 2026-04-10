const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./kitchen.db', (err) => {
    if (err) console.error('Database opening error:', err);
    console.log('Connected to SQLite Database: kitchen.db');
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS kitchen_store (
        id TEXT PRIMARY KEY,
        data_blob TEXT
    )`);
});

// Default data if DB is empty (Professionalized)
const defaultData = {
    customers: [],
    records: {},
    plans: [
        { id: 'p1', img: 'one_time_tiffin_plan_1775817234134.png', name: 'One-Time Tiffin', desc: 'Lunch OR Dinner — Fresh & Hot', price: 2700, unit: '/month', popular: false },
        { id: 'p2', img: 'two_time_tiffin_plan_1775817265055.png', name: 'Two-Time Tiffin', desc: 'Lunch AND Dinner — Full Meal', price: 5400, unit: '/month', popular: true },
        { id: 'p3', img: 'regular_tiffin_plan_1775817294391.png', name: 'Regular Tiffin', desc: 'Nutritious Base Meal', price: 100, unit: '/meal', popular: false }
    ],
    settings: { 
        phone1: '9325733447', phone2: '8999007643', insta: 'pnp_kitchenn', 
        address: 'Vardhaman Residency, Ulkanagari, Chhatrapati Sambhaji Nagar, Maharashtra' 
    }
};

// --- API ENDPOINTS ---

app.get('/api/data', (req, res) => {
    db.get("SELECT data_blob FROM kitchen_store WHERE id = 'master'", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) {
            return res.json(defaultData);
        }
        try {
            res.json(JSON.parse(row.data_blob));
        } catch (e) {
            res.status(500).json({ error: "Data Parse Error" });
        }
    });
});

app.post('/api/save', (req, res) => {
    const data = JSON.stringify(req.body);
    db.run("INSERT OR REPLACE INTO kitchen_store (id, data_blob) VALUES ('master', ?)", [data], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

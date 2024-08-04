// server.js
import express from "express";
import cors from "cors";

// Import the necessary modules
const app = express();
const port = 3001; // Define the port to run the server

app.use(cors());

// Define a route for the mock API
app.get('/api/example', (req, res) => {
    res.json({
        message: "Hello, this is a mock API response!",
        data: {
            id: 1,
            name: "Sample Data",
            description: "This is a sample description."
        }
    });
    console.log("/api/example hit");
});

// Library
app.get('/api/stats', (req, res) => {
    res.json({
        "totalCollection": 137,
        "totalMembers": 63,
        "totalLoanTransactions": 35,
        "totalOverdueBooks": 4
    });
    console.log("/api/stats hit");
});

app.get('/api/popular-books', (req, res) => {
    res.json([
        { "name": "The Postmistress", "count": 5 },
        { "name": "Tentang Kamu", "count": 19 }
    ]);
    console.log("/api/popular-books hit");
});

app.get('/api/top-borrowers', (req, res) => {
    res.json([
        { "name": "Afif Rana", "count": 27 },
        { "name": "Putri Melenia", "count": 19 }
      ]);
      console.log("/api/top-borrowers hit");
});

app.get('/api/recent-orders', (req, res) => {
    res.json([
        { "name": "The Postmistress", "status": "Proses" },
        { "name": "Tentang Kamu", "status": "Proses" }
      ]);
      console.log("/api/recent-orders hit");
});

// Start the server
app.listen(port, () => {
    console.log(`Mock API server is running at http://localhost:${port}`);
});

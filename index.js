const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(3000, () => {
            console.log("Server is Running at http://localhost:3000/");
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

app.post('/addTransaction', async (request, response) => {
    try {
        const transactionData = request.body;
        const { description, type, amount } = transactionData;
        const sqlQuery = `
        INSERT INTO transactions
            (description, type, amount) 
        VALUES (?, ?, ?)
    `;

        await db.run(sqlQuery, [description, type, amount]);
        response.status(200).send("transaction added successfully!");
    } catch (e) {
        console.error(`Error adding note: ${e.message}`);
        response.status(500).send("An error occurred while adding the note.");
    }
});

app.get('/getTransactions', async (request, response) => {
    try {
        const sqlQuery = `SELECT * FROM transactions ;`;

        const transactions = await db.all(sqlQuery);

        response.status(200).json(transactions);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});
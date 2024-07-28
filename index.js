const express = require("express");
const path = require("path");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow any origin
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(5000, () => {
            console.log("Server is Running at http://localhost:5000/");
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
        console.log(transactionData)
        // Fetch the current balance from the database
        const balanceQuery = `SELECT balance FROM transactions ORDER BY id DESC LIMIT 1`;
        const lastTransaction = await db.get(balanceQuery);
        let balance = lastTransaction ? lastTransaction.balance : 0;
        console.log(balance)
        // Adjust the balance based on the transaction type
        if(type == "Credit"){
            balance += amount;
        } else {
            balance -= amount;
        }

        const sqlQuery = `
            INSERT INTO transactions
                (description, type, amount, balance) 
            VALUES (?, ?, ?, ?)
        `;

        await db.run(sqlQuery, [description, type, amount, balance]);
        response.status(200).json({message:"Transaction added successfully!"});
    } catch (e) {
        console.error(`Error adding transaction: ${e.message}`);
        response.status(500).send("An error occurred while adding the transaction.");
    }
});


app.get('/getTransactions', async (request, response) => {
    try {
        const sqlQuery = `SELECT * FROM transactions ORDER BY  date DESC;`;

        const transactions = await db.all(sqlQuery);

        response.status(200).json(transactions);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});


app.get("/", async (request,response) => {
    try{
        response.status(200).send("Welcome artistAssignment");
    }catch (e){
        console.log(`Error: ${e.message}`);
        
    }
});

module.exports = app;
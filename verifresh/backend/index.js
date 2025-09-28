// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const solanaService = require('./solanaService'); // Import our Solana interaction logic

const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware ===
// This line is crucial for parsing JSON request bodies.
app.use(express.json());
// This allows requests from your frontend.
app.use(cors());


// === API Routes ===

/**
 * POST /products
 * Creates a new product on the Solana blockchain.
 * Body: { "productId": number, "name": string, "farmName": string }
 */
app.post('/products', async (req, res) => {
    try {
        const { productId, name, farmName } = req.body;
        if (productId === undefined || !name || !farmName) {
            return res.status(400).json({ message: "Missing required fields: productId, name, farmName." });
        }

        console.log(`Received request to create product ID: ${productId}`);
        const txSignature = await solanaService.createProduct(productId, name, farmName);

        res.status(201).json({
            message: "Product created successfully on the blockchain.",
            transactionSignature: txSignature
        });

    } catch (error) {
        console.error("POST /products Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * POST /products/:id/logs
 * Adds a new log entry to an existing product's history.
 * Body: { "status": string, "location": string }
 */
app.post('/products/:id/logs', async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const { status, location } = req.body;

        if (isNaN(productId) || !status || !location) {
            return res.status(400).json({ message: "Missing required fields: status, location." });
        }

        console.log(`Received request to add log to product ID: ${productId}`);
        const txSignature = await solanaService.addLog(productId, status, location);

        res.json({
            message: "Log added successfully to the blockchain.",
            transactionSignature: txSignature
        });

    } catch (error) {
        console.error("POST /products/:id/logs Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * GET /products/:id
 * Fetches a product's full history from the Solana blockchain.
 */
app.get('/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        console.log(`Received request to fetch product ID: ${productId}`);
        const productData = await solanaService.getProduct(productId);

        if (!productData) {
            return res.status(404).json({ message: "Product not found on the blockchain." });
        }

        // This is where we will integrate the Gemini AI call in the next step.

        res.json({
            message: "Product data fetched successfully from Solana.",
            productData
        });

    } catch (error) {
        console.error("GET /products/:id Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// === Start Server ===
app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});
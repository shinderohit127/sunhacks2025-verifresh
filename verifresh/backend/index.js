// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer'); // For handling multipart/form-data (if needed in future)
const solanaService = require('./solanaService'); // Import our Solana interaction logic
const geminiService = require('./geminiService'); // Import our Gemini AI interaction logic

const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware ===
// This line is crucial for parsing JSON request bodies.
app.use(express.json());
// This allows requests from your frontend.
app.use(cors());

// Configure Multer to handle a single image file stored in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// === NEW HEALTH CHECK ROUTE ===
app.get('/health', (req, res) => {
    console.log("✅ GET /health endpoint was reached successfully!");
    res.status(200).json({ status: "ok", message: "Server is alive!" });
});

// === API Routes ===

/**
 * POST /products
 * Creates a new product on the Solana blockchain.
 * Body: { "productId": number, "name": string, "farmName": string }
 */
app.post('/products', async (req, res) => {
    console.log("--- Handler for POST /products has been entered. ---");
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

        const aiInsights = await geminiService.generateMultimodalInsights(productData);

        res.json({
            message: "Product data and AI insights fetched successfully.",
            productData,
            aiInsights
        });

    } catch (error) {
        console.error("GET /products/:id Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// === NEW MULTIMODAL ENDPOINT ===
/**
 * POST /products/:id/image
 * Uploads an image for a product and gets a multimodal AI analysis.
 * The image should be sent as 'productImage' in a multipart/form-data request.
 */
app.post('/products/:id/image', upload.single('productImage'), async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded." });
        }

        // 1. Fetch the product data from Solana
        const productData = await solanaService.getProduct(productId);
        if (!productData) {
            return res.status(404).json({ message: "Product not found on the blockchain." });
        }

        // 2. Call the new Gemini service function with both text and image data
        const aiInsights = await geminiService.generateMultimodalInsights(productData, req.file);

        // 3. Send back the combined response
        res.json({
            message: "Multimodal AI insights generated successfully.",
            productData,
            aiInsights
        });

    } catch (error) {
        console.error("POST /products/:id/image Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// === Start Server ===
app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});
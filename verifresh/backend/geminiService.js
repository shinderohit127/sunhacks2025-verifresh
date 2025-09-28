require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Initialization ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the .env file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// === Helper Function ===
/**
 * Converts a buffer from an uploaded file into the format Google's API requires.
 * @param {Buffer} buffer - The image file buffer from multer.
 * @param {string} mimeType - The mime type of the image (e.g., 'image/png').
 * @returns {object} - The formatted image part object.
 */
function fileToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType,
        },
    };
}


// === Service Functions ===

/**
 * Generates AI-powered insights for a given product.
 * @param {object} productData - The product data fetched from the Solana blockchain.
 * @param {object} imageFile - The image file object from multer (req.file).
 * @returns {object} - The parsed JSON insights from the AI.
 */
async function generateMultimodalInsights(productData, imageFile) {
    console.log(`Generating MULTIMODAL AI insights for product: ${productData.name}`);

    const historyLog = productData.history.map(log =>
        `- At timestamp ${log.timestamp}, status was updated to "${log.status}" at location "${log.location}".`
    ).join('\n');

    const textPrompt = `
        You are a supply chain and food quality analyst for a premium grocery store called "VeriFresh".
        Your task is to analyze the provided supply chain data AND an image of the product to generate a customer-facing summary.
        Your output MUST be a valid JSON object with the following keys: "freshness_score", "estimated_shelf_life", "quality_assessment", "visual_inspection", and "transit_anomalies". Do not include any other text or markdown formatting.

        DATA ANALYSIS:
        - freshness_score: An integer between 1 and 10, based on time since harvest.
        - estimated_shelf_life: A string estimating remaining shelf life.
        - transit_anomalies: A string that is "None detected." unless the history log shows long delays.

        IMAGE ANALYSIS (based on the provided photo):
        - visual_inspection: A one-sentence summary of the product's appearance. Comment on ripeness, color, and any visible blemishes.

        OVERALL ASSESSMENT:
        - quality_assessment: A brief, reassuring summary combining both the data and visual analysis.

        Here is the data for the product "${productData.name}" from "${productData.farmName}":
        - Harvested at timestamp: ${productData.harvestTimestamp}
        - Current UNIX timestamp: ${Math.floor(Date.now() / 1000)}
        - Supply Chain History:
        ${historyLog}
    `;

    const imagePart = fileToGenerativePart(imageFile.buffer, imageFile.mimetype);

    try {
        const result = await model.generateContent([textPrompt, imagePart]); // Pass both text and image
        const response = await result.response;
        const text = response.text();

        const cleanedJsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const insights = JSON.parse(cleanedJsonString);

        return insights;

    } catch (error) {
        console.error("Error generating multimodal insights from Gemini:", error);
        return {
            freshness_score: null,
            estimated_shelf_life: "N/A",
            quality_assessment: "Could not generate AI insights.",
            visual_inspection: "Could not perform visual analysis.",
            transit_anomalies: "Unknown",
        };
    }
}

module.exports = {
    generateMultimodalInsights,
};
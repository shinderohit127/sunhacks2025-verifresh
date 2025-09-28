require('dotenv').config();
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const { AnchorProvider, Program, BN } = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Load variables from our .env file.
const RPC_URL = process.env.SOLANA_RPC_URL;
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID);

// Parse the server's secret key from the environment variable.
const secretKeyArray = JSON.parse(process.env.SERVER_WALLET_SECRET_KEY);
const serverKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

// --- Setup Solana Connection ---
const connection = new Connection(RPC_URL, 'confirmed');

const wallet = {
  publicKey: serverKeypair.publicKey,
  signTransaction: async (tx) => {
    tx.sign(serverKeypair);
    return tx;
  },
  signAllTransactions: async (txs) => {
    txs.forEach(tx => tx.sign(serverKeypair));
    return txs;
  }
};

// The AnchorProvider is a crucial wrapper that bundles the connection and wallet,
// allowing our server to sign and send transactions to the blockchain.
const provider = new AnchorProvider(
    connection,
    // The wallet object requires a publicKey and a signTransaction method.
    wallet,
    { commitment: "confirmed" }
);

// --- Load the Deployed Program ---
// Load the Interface Definition Language (IDL) file, which describes our program's interface.
const idlPath = path.join(__dirname, 'verifresh_program.json'); // Make sure your IDL file is named this
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

// Create a JavaScript Program object that we can use to interact with our on-chain program.
const program = new Program(idl, provider);

console.log(`Solana service configured for program: ${program.programId.toBase58()}`);
console.log(`Server wallet address: ${serverKeypair.publicKey.toBase58()}`);


// === Service Functions (Exported for use in index.js) ===

/**
 * Creates a new product on the blockchain by calling the 'create_product' instruction.
 * @param {number} productId The unique ID for the new product.
 * @param {string} name The name of the product.
 * @param {string} farmName The name of the farm.
 * @returns {string} The transaction signature.
 */
async function createProduct(productId, name, farmName) {
    // Calculate the Program Derived Address (PDA) for the new product account.
    // This creates a unique, predictable address for each product ID.
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), new BN(productId).toBuffer('le', 8)],
        program.programId
    );

    console.log(`Creating new product with ID ${productId} at PDA: ${pda.toBase58()}`);

    // Call the 'createProduct' method on our program object.
    const txSignature = await program.methods
        .createProduct(new BN(productId), name, farmName) // Note: camelCase name
        .accounts({
            product: pda,
            payer: serverKeypair.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc(); // .rpc() sends the transaction to the network.

    return txSignature;
}

/**
 * Adds a new log entry to a product's history by calling the 'add_log' instruction.
 * @param {number} productId The ID of the product to update.
 * @param {string} status The new status log (e.g., "Shipped").
 * @param {string} location The new location log (e.g., "Distributor Warehouse").
 * @returns {string} The transaction signature.
 */
async function addLog(productId, status, location) {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), new BN(productId).toBuffer('le', 8)],
        program.programId
    );

    console.log(`Adding log to product PDA: ${pda.toBase58()}`);

    const txSignature = await program.methods
        .addLog(status, location) // Note: camelCase name
        .accounts({
            product: pda,
            authority: serverKeypair.publicKey, // The server's wallet is the authority
        })
        .rpc();

    return txSignature;
}

/**
 * Fetches a product's data from its on-chain account.
 * @param {number} productId The ID of the product to fetch.
 * @returns {object|null} The product account data or null if it doesn't exist.
 */
async function getProduct(productId) {
    try {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("product"), new BN(productId).toBuffer('le', 8)],
            program.programId
        );
        console.log(`Fetching product at PDA: ${pda.toBase58()}`);

        // Use the .fetch() method to retrieve the account data from the blockchain.
        const productData = await program.account.product.fetch(pda);
        return productData;
    } catch (error) {
        // It's common for fetch to fail if an account with that ID hasn't been created yet.
        // We log the error and return null to handle this gracefully in our API.
        console.error(`Error fetching product ID ${productId}:`, error.message);
        return null;
    }
}

// Export the functions to make them available to other files in our project.
module.exports = {
    createProduct,
    addLog,
    getProduct,
};
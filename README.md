# SunHacks2025 VeriFresh

## Introduction

SunHacks2025 VeriFresh is a robust platform designed to ensure the freshness and authenticity of perishable products. It leverages modern web technologies to streamline the verification process for sellers and buyers, fostering transparency and trust in the supply chain. This repository houses the complete implementation, including backend APIs, frontend interfaces, and essential configuration files.

## Features

- User authentication and management for buyers and sellers
- Real-time product verification and status tracking
- RESTful API for integration with third-party systems
- Intuitive dashboard for product management
- Detailed product history and verification logs
- Role-based access control for enhanced security

## Requirements

Before installation, ensure your environment meets the following prerequisites:

- Node.js (version 16.x or higher)
- npm, yarn, pnpm, or bun for package management
- MongoDB or a compatible database instance
- Modern web browser for frontend access

## Installation

Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/shinderohit127/sunhacks2025-verifresh.git
   cd sunhacks2025-verifresh
   ```

2. Install dependencies using your preferred package manager:
   ```packagemanagers
   {
       "commands": {
           "npm": "npm install",
           "yarn": "yarn install",
           "pnpm": "pnpm install",
           "bun": "bun install"
       }
   }
   ```

3. Configure environment variables (see Configuration section).

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

Once installed and running, you can access the VeriFresh dashboard at `http://localhost:3000` (or your configured port). The application supports the following core workflows:

- Register as a buyer or seller and log in
- Add new perishable products for verification
- Scan and verify products using their unique identifiers
- View product history and verification status in the dashboard
- Integrate with third-party systems via the REST API

### API Endpoints

Below are the main API endpoints available in VeriFresh.

```api
{
    "title": "User Registration",
    "description": "Register a new user as a buyer or seller.",
    "method": "POST",
    "baseUrl": "http://localhost:3000/api",
    "endpoint": "/auth/register",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"username\": \"johndoe\",\n  \"password\": \"securepassword\",\n  \"role\": \"buyer\"\n}",
    "responses": {
        "201": {
            "description": "User registered successfully",
            "body": "{\n  \"message\": \"Registration successful\",\n  \"userId\": \"abc123\"\n}"
        },
        "400": {
            "description": "Invalid input",
            "body": "{\n  \"error\": \"Missing fields or invalid data\" \n}"
        }
    }
}
```

```api
{
    "title": "User Login",
    "description": "Authenticate an existing user and retrieve a token.",
    "method": "POST",
    "baseUrl": "http://localhost:3000/api",
    "endpoint": "/auth/login",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"username\": \"johndoe\",\n  \"password\": \"securepassword\"\n}",
    "responses": {
        "200": {
            "description": "Login successful",
            "body": "{\n  \"token\": \"jwt-token-value\"\n}"
        },
        "401": {
            "description": "Unauthorized",
            "body": "{\n  \"error\": \"Invalid credentials\" \n}"
        }
    }
}
```

```api
{
    "title": "Add Product",
    "description": "Add a new perishable product for verification.",
    "method": "POST",
    "baseUrl": "http://localhost:3000/api",
    "endpoint": "/products",
    "headers": [
        {
            "key": "Authorization",
            "value": "Bearer <token>",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"name\": \"Fresh Tomatoes\",\n  \"batchId\": \"BATCH2025\",\n  \"expiryDate\": \"2025-06-30\"\n}",
    "responses": {
        "201": {
            "description": "Product added successfully",
            "body": "{\n  \"productId\": \"prod456\"\n}"
        },
        "400": {
            "description": "Invalid product data",
            "body": "{\n  \"error\": \"Missing or invalid fields\" \n}"
        }
    }
}
```

```api
{
    "title": "Verify Product",
    "description": "Verify the authenticity and freshness of a product by its unique identifier.",
    "method": "GET",
    "baseUrl": "http://localhost:3000/api",
    "endpoint": "/products/verify/:id",
    "headers": [
        {
            "key": "Authorization",
            "value": "Bearer <token>",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [
        {
            "key": "id",
            "value": "Product ID",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Verification successful",
            "body": "{\n  \"status\": \"fresh\",\n  \"verifiedAt\": \"2024-06-15T12:00:00Z\"\n}"
        },
        "404": {
            "description": "Product not found",
            "body": "{\n  \"error\": \"Product does not exist\" \n}"
        }
    }
}
```

## Configuration

The application relies on environment variables for secure and flexible configuration. Create a `.env` file in the project root with the following keys:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/verifresh
JWT_SECRET=your_jwt_secret
```

Adjust the values to fit your environment. Refer to sample or template files in the repository for more details.

## Contributing

We welcome contributions from the community! To contribute:

- Fork the repository and create your branch
- Make your changes and add relevant tests
- Submit a pull request with a clear description of your changes

Please follow the established code style. For feature requests, bug reports, or questions, open an issue in the repository.

## License

This project is licensed under the MIT License. See the `LICENSE` file for full license text. You are free to use, modify, and distribute this software in your projects.

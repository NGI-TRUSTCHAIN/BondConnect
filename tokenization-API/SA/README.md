# BounceDapp API

Backend service for the BounceDapp tokenization platform.  
Provides endpoints to deploy smart contracts, manage bonds, transfer tokens and more, all secured with an API key.

---

## Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- TypeScript global tools (optional, recommended)

---

## Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd tokenization-API/SA      
npm install



Copy and configure the environment variables:

cp .env.example .env
# edit .env to match your local configuration


Start the TypeScript server in watch mode:

npm start

The API will be available at:
http://localhost:4000

API Documentation (Swagger)

Interactive API docs are served automatically via Swagger-UI.

URL: http://localhost:4000/api-docs

Shows all available endpoints, request/response schemas and allows live testing.


API Key Security

Every request (except /api-docs) requires an API key sent via the x-api-key header.
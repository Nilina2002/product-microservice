# Product Stock Microservice

A **microservices-based backend system** for product and stock management with authentication.

This project focuses on **service isolation, database ownership, JWT-based authentication, and clean REST communication** between services.

---

## 🔎 Project Overview

The system consists of three independent services:

- **API Gateway** – Single entry point for clients (routing + auth validation)
- **Auth Service** – User & company management, authentication
- **Product Service** – Product CRUD, stock management, audit logging

Each service:

- Runs independently
- Owns its own database
- Communicates via REST APIs
- Uses environment variables for configuration

---

## ✅ Current Status

### Working

- **Auth Service (Port 5001)**

  - User registration and login
  - JWT generation with user_id, company_id, role
  - Password hashing using bcrypt

- **Product Service (Port 5002)**

  - Product creation and listing
  - Stock updates with validation (no negative stock)
  - Stock change audit logging

- **Databases**

  - Auth Service → MongoDB (Prisma)
  - Product Service → MongoDB (Prisma)

- **Environment Configuration**

  - Environment variables documented via `.env.example` files
  - Secrets are not committed to the repository

### Known Limitations

- **API Gateway (Port 5000)**

  - Implemented but routing logic currently causes request hangs
  - Under refinement

➡️ **For evaluation and testing, services can be accessed directly** (instructions below).

---

## 🏗️ Architecture

```
Client
  │
  ▼
API Gateway (5000)
  │
  ├── Auth Service (5001) ── MongoDB
  │
  └── Product Service (5002) ── MongoDB
```

- Gateway validates JWTs and forwards requests
- Services do not share databases
- Company-based data isolation enforced at service level

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies

```bash
cd api-gateway && npm install
cd ../auth-micro && npm install
cd ../product-micro && npm install
```

---

### 2️⃣ Setup Environment Variables

Each service contains a `.env.example` file.
Create a `.env` file in each service directory and provide your own values.

#### api-gateway/.env

```env
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001/api
PRODUCT_SERVICE_URL=http://localhost:5002/api
JWT_SECRET=your_secret_key_here
```

#### auth-micro/.env

```env
PORT=5001
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

#### product-micro/.env

```env
PORT=5002
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

---

### 3️⃣ Setup Databases

```bash
# Auth Service
cd auth-micro
npx prisma generate
npx prisma db push

# Product Service
cd ../product-micro
npx prisma generate
npx prisma db push
```

---

### 4️⃣ Start Services

**Start services in the following order:**

```bash
# Terminal 1
cd auth-micro
node server.js

# Terminal 2
cd product-micro
node server.js

# Terminal 3
cd api-gateway
node server.js
```

> Note: `node server.js` is recommended instead of `npm run dev` for stability.

---

## 🧪 Testing the System

### ⚠️ Temporary Testing Approach

Until API Gateway routing is finalized, **test services directly**.

### Auth Service (5001)

- `POST /api/register`
- `POST /api/login`

### Product Service (5002)

- `POST /api/products`
- `GET /api/products`
- `POST /api/update`

All product endpoints require a valid JWT token.

---

## 📌 Sample Requests (curl)

### Register User

```bash
curl -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "companyName": "Acme Corp"
  }'
```

### Login

```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Product

```bash
curl -X POST http://localhost:5002/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product 1",
    "sku": "SKU-001",
    "quantity": 100
  }'
```

---

## 📚 API Summary

### Auth Service

- `POST /auth/register`
- `POST /auth/login`

### Product Service

- `POST /products`
- `GET /products`
- `POST /stock/update`

---

## 🗂️ Project Structure

```
product-stock-microservice/
├── api-gateway/
├── auth-micro/
├── product-micro/
├── requirements-checklist.md
├── verify-requirements.js
└── README.md
```

---

## 📄 Documentation

- Architecture & decisions: **README.md**
- Requirement mapping: **requirements-checklist.md**
- Automated verification: **verify-requirements.js**

---

## 🔮 Future Improvements

- Fix API Gateway routing logic
- Add centralized logging
- Add pagination & search
- Dockerize services using Docker Compose
- Health check endpoints

---

## 👤 Author

**Nilina Nilaksha Amarathunga**

---

## ⚠️ Security Note

Sensitive values such as database URLs and JWT secrets are intentionally excluded from the repository. Environment variables are provided via `.env.example` files.

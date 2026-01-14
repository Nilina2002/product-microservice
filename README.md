# Product Stock Microservice

A microservices-based product and stock management system with authentication.

## Architecture

- **API Gateway** (Port 5000) - Routes requests and handles authentication
- **Auth Service** (Port 5001) - User registration and authentication (MongoDB)
- **Product Service** (Port 5002) - Product and stock management (PostgreSQL)

## Quick Start

### 1. Install Dependencies

```bash
# Install dependencies for each service
cd api-gateway && npm install
cd ../auth-micro && npm install
cd ../product-micro && npm install
```

### 2. Setup Environment Variables

Create `.env` files in each service directory:

**api-gateway/.env**
```
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001/api
PRODUCT_SERVICE_URL=http://localhost:5002/api
JWT_SECRET=your_secret_key_here
```

**auth-micro/.env**
```
PORT=5001
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

**product-micro/.env**
```
PORT=5002
DATABASE_URL=your_postgresql_connection_string
```

### 3. Setup Databases

```bash
# Auth service (MongoDB)
cd auth-micro
npx prisma generate
npx prisma db push

# Product service (PostgreSQL)
cd product-micro
npx prisma generate
npx prisma db push
```

### 4. Start Services

```bash
# Terminal 1 - API Gateway
cd api-gateway
npm run dev

# Terminal 2 - Auth Service
cd auth-micro
npm run dev

# Terminal 3 - Product Service
cd product-micro
npm run dev
```

## Verify Requirements

### Option 1: Automated Testing Script

```bash
# Install axios in root (if not already installed)
npm install axios dotenv

# Run verification script
node verify-requirements.js
```

### Option 2: Manual Testing

Use the checklist in `requirements-checklist.md` and test endpoints manually.

### Option 3: Using curl or Postman

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "companyName": "Acme Corp"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Create Product (use token from login)
```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Product 1",
    "companyId": "YOUR_COMPANY_ID",
    "stock": 100
  }'
```

#### 4. List Products
```bash
curl -X GET "http://localhost:5000/products?companyId=YOUR_COMPANY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Update Stock
```bash
curl -X POST http://localhost:5000/stock/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "companyId": "YOUR_COMPANY_ID",
    "amount": 50,
    "type": "increase",
    "note": "Restocked"
  }'
```

## API Endpoints

### Public Endpoints
- `POST /auth/register` - Register new user and company
- `POST /auth/login` - Login and get JWT token

### Protected Endpoints (require JWT token)
- `POST /products` - Create a new product
- `GET /products?companyId=xxx` - List products (filter by companyId)
- `POST /stock/update` - Update product stock (increase/decrease)

## Requirements Checklist

See `requirements-checklist.md` for a detailed checklist of all requirements.

## Project Structure

```
product-stock-microservice/
├── api-gateway/          # API Gateway service
├── auth-micro/           # Authentication service
├── product-micro/        # Product and stock service
├── requirements-checklist.md  # Requirements checklist
├── verify-requirements.js     # Automated test script
└── README.md             # This file
```

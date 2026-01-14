import axios from "axios";
import "dotenv/config";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:5000";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = "") {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✓ ${name}`, "green");
  } else {
    testResults.failed++;
    log(`✗ ${name}`, "red");
    if (details) log(`  ${details}`, "red");
  }
}

async function checkServiceHealth(url, serviceName) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function testAuthRegistration() {
  log("\n=== Testing Auth Registration ===", "cyan");
  
  try {
    const testUser = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "testpassword123",
      companyName: "Test Company",
    };

    const response = await axios.post(`${API_GATEWAY_URL}/auth/register`, testUser);
    
    logTest(
      "POST /auth/register - Registration successful",
      response.status === 200 && response.data.user && response.data.company,
      `Status: ${response.status}`
    );
    
    logTest(
      "POST /auth/register - Returns user data",
      response.data.user && response.data.user.email === testUser.email,
      `Expected email: ${testUser.email}`
    );
    
    logTest(
      "POST /auth/register - Returns company data",
      response.data.company && response.data.company.name === testUser.companyName,
      `Expected company: ${testUser.companyName}`
    );

    return { user: response.data.user, company: response.data.company };
  } catch (error) {
    logTest(
      "POST /auth/register - Registration endpoint",
      false,
      error.response ? `Status: ${error.response.status}, ${error.response.data.message}` : error.message
    );
    return null;
  }
}

async function testAuthLogin(email, password) {
  log("\n=== Testing Auth Login ===", "cyan");
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/auth/login`, {
      email,
      password,
    });

    const hasToken = response.data.access_token && response.data.access_token.startsWith("Bearer ");
    
    logTest(
      "POST /auth/login - Login successful",
      response.status === 200 && hasToken,
      `Status: ${response.status}`
    );
    
    logTest(
      "POST /auth/login - Returns Bearer token",
      hasToken,
      hasToken ? "Token format correct" : "Token missing or invalid format"
    );

    return response.data.access_token;
  } catch (error) {
    logTest(
      "POST /auth/login - Login endpoint",
      false,
      error.response ? `Status: ${error.response.status}, ${error.response.data.message}` : error.message
    );
    return null;
  }
}

async function testCreateProduct(token, companyId) {
  log("\n=== Testing Product Creation ===", "cyan");
  
  try {
    const product = {
      name: `Test Product ${Date.now()}`,
      companyId: companyId,
      stock: 100,
    };

    const response = await axios.post(
      `${API_GATEWAY_URL}/products`,
      product,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    logTest(
      "POST /products - Create product (protected)",
      response.status === 200 && response.data.product,
      `Status: ${response.status}`
    );
    
    logTest(
      "POST /products - Returns product data",
      response.data.product && response.data.product.name === product.name,
      `Expected name: ${product.name}`
    );

    return response.data.product;
  } catch (error) {
    logTest(
      "POST /products - Create product endpoint",
      false,
      error.response ? `Status: ${error.response.status}, ${error.response.data.message}` : error.message
    );
    return null;
  }
}

async function testListProducts(token, companyId) {
  log("\n=== Testing Product Listing ===", "cyan");
  
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/products`, {
      headers: {
        Authorization: token,
      },
      params: {
        companyId: companyId,
      },
    });

    logTest(
      "GET /products - List products (protected)",
      response.status === 200 && Array.isArray(response.data.products),
      `Status: ${response.status}`
    );
    
    logTest(
      "GET /products - Returns products array",
      Array.isArray(response.data.products),
      `Found ${response.data.products?.length || 0} products`
    );

    return response.data.products;
  } catch (error) {
    logTest(
      "GET /products - List products endpoint",
      false,
      error.response ? `Status: ${error.response.status}, ${error.response.data.message}` : error.message
    );
    return null;
  }
}

async function testUpdateStock(token, productId, companyId) {
  log("\n=== Testing Stock Update ===", "cyan");
  
  try {
    // Test increase stock
    const increaseResponse = await axios.post(
      `${API_GATEWAY_URL}/stock/update`,
      {
        productId: productId,
        companyId: companyId,
        amount: 50,
        type: "increase",
        note: "Test stock increase",
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    logTest(
      "POST /stock/update - Increase stock (protected)",
      increaseResponse.status === 200 && increaseResponse.data.product,
      `Status: ${increaseResponse.status}`
    );

    const newStock = increaseResponse.data.product.stock;

    // Test decrease stock
    const decreaseResponse = await axios.post(
      `${API_GATEWAY_URL}/stock/update`,
      {
        productId: productId,
        companyId: companyId,
        amount: 25,
        type: "decrease",
        note: "Test stock decrease",
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    logTest(
      "POST /stock/update - Decrease stock",
      decreaseResponse.status === 200 && decreaseResponse.data.product.stock === newStock - 25,
      `Status: ${decreaseResponse.status}`
    );

    // Test negative stock prevention
    try {
      await axios.post(
        `${API_GATEWAY_URL}/stock/update`,
        {
          productId: productId,
          companyId: companyId,
          amount: 10000,
          type: "decrease",
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      logTest(
        "POST /stock/update - Prevents negative stock",
        false,
        "Should have rejected negative stock"
      );
    } catch (error) {
      logTest(
        "POST /stock/update - Prevents negative stock",
        error.response?.status === 400,
        `Status: ${error.response?.status}`
      );
    }

    return true;
  } catch (error) {
    logTest(
      "POST /stock/update - Stock update endpoint",
      false,
      error.response ? `Status: ${error.response.status}, ${error.response.data.message}` : error.message
    );
    return false;
  }
}

async function testAuthProtection() {
  log("\n=== Testing Authentication Protection ===", "cyan");
  
  try {
    await axios.post(`${API_GATEWAY_URL}/products`, {
      name: "Test",
      companyId: "test",
    });
    logTest(
      "POST /products - Requires authentication",
      false,
      "Should have returned 401"
    );
  } catch (error) {
    logTest(
      "POST /products - Requires authentication",
      error.response?.status === 401,
      `Status: ${error.response?.status}`
    );
  }

  try {
    await axios.get(`${API_GATEWAY_URL}/products`);
    logTest(
      "GET /products - Requires authentication",
      false,
      "Should have returned 401"
    );
  } catch (error) {
    logTest(
      "GET /products - Requires authentication",
      error.response?.status === 401,
      `Status: ${error.response?.status}`
    );
  }

  try {
    await axios.post(`${API_GATEWAY_URL}/stock/update`, {
      productId: "test",
      companyId: "test",
      amount: 10,
      type: "increase",
    });
    logTest(
      "POST /stock/update - Requires authentication",
      false,
      "Should have returned 401"
    );
  } catch (error) {
    logTest(
      "POST /stock/update - Requires authentication",
      error.response?.status === 401,
      `Status: ${error.response?.status}`
    );
  }
}

async function runAllTests() {
  log("\n" + "=".repeat(60), "blue");
  log("  PRODUCT STOCK MICROSERVICE - REQUIREMENTS VERIFICATION", "blue");
  log("=".repeat(60) + "\n", "blue");

  // Check service health
  log("=== Checking Service Health ===", "cyan");
  const gatewayHealth = await checkServiceHealth(API_GATEWAY_URL, "API Gateway");
  const authHealth = await checkServiceHealth(AUTH_SERVICE_URL, "Auth Service");
  const productHealth = await checkServiceHealth(PRODUCT_SERVICE_URL, "Product Service");

  logTest("API Gateway is running", gatewayHealth, `URL: ${API_GATEWAY_URL}`);
  logTest("Auth Service is running", authHealth, `URL: ${AUTH_SERVICE_URL}`);
  logTest("Product Service is running", productHealth, `URL: ${PRODUCT_SERVICE_URL}`);

  if (!gatewayHealth || !authHealth || !productHealth) {
    log("\n⚠️  Some services are not running. Please start all services before running tests.", "yellow");
    return;
  }

  // Test registration
  const registrationResult = await testAuthRegistration();
  if (!registrationResult) {
    log("\n⚠️  Registration failed. Cannot continue with other tests.", "yellow");
    printSummary();
    return;
  }

  const { user, company } = registrationResult;

  // Test login
  const token = await testAuthLogin(user.email, "testpassword123");
  if (!token) {
    log("\n⚠️  Login failed. Cannot continue with protected endpoint tests.", "yellow");
    printSummary();
    return;
  }

  // Test product creation
  const product = await testCreateProduct(token, company.id);
  if (!product) {
    log("\n⚠️  Product creation failed. Cannot continue with stock tests.", "yellow");
    printSummary();
    return;
  }

  // Test product listing
  await testListProducts(token, company.id);

  // Test stock update
  await testUpdateStock(token, product.id, company.id);

  // Test authentication protection
  await testAuthProtection();

  printSummary();
}

function printSummary() {
  log("\n" + "=".repeat(60), "blue");
  log("  TEST SUMMARY", "blue");
  log("=".repeat(60), "blue");
  log(`Total Tests: ${testResults.total}`, "cyan");
  log(`Passed: ${testResults.passed}`, "green");
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? "red" : "green");
  log("=".repeat(60) + "\n", "blue");

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  if (passRate === "100.0") {
    log("🎉 All tests passed! Requirements are met.", "green");
  } else {
    log(`⚠️  Pass rate: ${passRate}% - Some requirements may not be met.`, "yellow");
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, "red");
  process.exit(1);
});

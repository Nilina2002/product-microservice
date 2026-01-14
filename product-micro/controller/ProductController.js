import prisma from "../config/db.config.js";

class ProductController {
  // POST /products
  static async createProduct(req, res) {
    try {
      const { name, companyId, stock } = req.body;

      if (!name || !companyId) {
        return res
          .status(400)
          .json({ message: "name and companyId are required" });
      }

      const initialStock = typeof stock === "number" ? stock : 0;

      const product = await prisma.product.create({
        data: {
          name,
          companyId,
          stock: initialStock,
        },
      });

      return res.json({ message: "Product created", product });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  // GET /products
  // very simple list, can filter by companyId with query param
  static async listProducts(req, res) {
    try {
      const { companyId } = req.query;

      const where = {};
      if (companyId) {
        where.companyId = companyId;
      }

      const products = await prisma.product.findMany({
        where,
      });

      return res.json({ products });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  // POST /stock/update
  static async updateStock(req, res) {
    try {
      const { productId, companyId, amount, type, note } = req.body;

      if (!productId || !companyId || !amount || !type) {
        return res.status(400).json({
          message: "productId, companyId, amount and type are required",
        });
      }

      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let change = 0;
      if (type === "increase") {
        change = amount;
      } else if (type === "decrease") {
        change = -amount;
      } else {
        return res.status(400).json({ message: "type must be increase or decrease" });
      }

      const newStock = product.stock + change;
      if (newStock < 0) {
        return res
          .status(400)
          .json({ message: "Stock cannot go negative" });
      }

      const updated = await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: newStock,
        },
      });

      await prisma.stockLog.create({
        data: {
          productId: product.id,
          companyId,
          change,
          note: note || null,
        },
      });

      return res.json({
        message: "Stock updated",
        product: updated,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
}

export default ProductController;


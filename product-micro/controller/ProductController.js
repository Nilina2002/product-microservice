import prisma from "../config/db.config.js";

class ProductController {

  static async createProduct(req, res) {
    try {
      const { name, stock } = req.body;
      const companyId = req.user.company_id;
      if (!name) {
        return res.status(400).json({ message: "name is required" });
      }

      if (!companyId) {
        return res.status(401).json({ message: "Company ID not found in token" });
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

  static async listProducts(req, res) {
    try {
      const companyId = req.user.company_id;

      if (!companyId) {
        return res.status(401).json({ message: "Company ID not found in token" });
      }

      const products = await prisma.product.findMany({
        where: {
          companyId: companyId,
        },
      });

      return res.json({ products });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  static async updateStock(req, res) {
    try {
      const { productId, amount, type, note } = req.body;
      const companyId = req.user.company_id;

      if (!productId || !amount || !type) {
        return res.status(400).json({
          message: "productId, amount and type are required",
        });
      }

      if (!companyId) {
        return res.status(401).json({ message: "Company ID not found in token" });
      }

      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.companyId !== companyId) {
        return res.status(403).json({
          message: "Access denied: You can only update products from your own company",
        });
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


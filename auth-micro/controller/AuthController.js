import bcrypt from "bcrypt"
import "dotenv/config"
import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken"

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, companyName } = req.body;
            if (!name || !email || !password || !companyName) {
                return res.status(400).json({ message: "name, email, password and companyName are required" });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const company = await prisma.company.create({
                data: {
                    name: companyName,
                },
            });

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    companyId: company.id,
                    role: "admin",
                },
            });
            return res.json({ message: "Account created successfully", user, company });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Something went wrong" });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "email and password are required" });
            }

            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const passwordsMatch = bcrypt.compareSync(password, user.password);
            if (!passwordsMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const payload = {
                user_id: user.id,
                company_id: user.companyId,
                role: user.role,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET , {
                expiresIn: "1d",
            });

            return res.json({
                message: "Logged in successfully",
                access_token: `Bearer ${token}`,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Something went wrong" });
        }
    }
}

export default AuthController;
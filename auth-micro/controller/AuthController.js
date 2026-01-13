class AuthController {
    static async register(req, res) {
        const paylaod = req.body

        return res.json({ paylaod })
    }
}

export default AuthController;
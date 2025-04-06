const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Unauthorized access" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    req.user = user;
    next();
};

module.exports = authMiddleware;

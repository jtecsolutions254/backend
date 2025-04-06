const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const Candidate = require("./models/Candidate");
const User = require("./models/User");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ Database Connection
const MONGO_URI = "mongodb://localhost:27017/voting-system";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Fetch Candidates with Filtering
app.get("/candidates", async (req, res) => {
    try {
        const { department, category } = req.query;
        let filter = {};
        if (department) filter.department = department;
        if (category) filter.category = category;

        const candidates = await Candidate.find(filter);
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch candidates", error });
    }
});

// ✅ Register User (with password hashing)
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, hasVoted: false });
        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering user", error });
    }
});

// ✅ Login User (password verification)
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        res.json({ success: true, message: "Login successful", user: { name: user.name, email: user.email, hasVoted: user.hasVoted } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error logging in", error });
    }
});

// ✅ Cast a Vote
app.post("/vote", async (req, res) => {
    try {
        const { email, candidateId } = req.body;

        if (!email || !candidateId) {
            return res.status(400).json({ success: false, message: "Email and Candidate ID are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.hasVoted) {
            return res.status(400).json({ success: false, message: "You have already voted" });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        candidate.votes = (candidate.votes || 0) + 1;
        await candidate.save();

        user.hasVoted = true;
        await user.save();

        res.json({ success: true, message: `Vote cast for ${candidate.name}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error casting vote", error });
    }
});

// ✅ Fetch Results
app.get("/results", async (req, res) => {
    try {
        const results = await Candidate.find({}, { name: 1, votes: 1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching results", error });
    }
});

// ✅ Check if User has Voted
app.get("/hasVoted", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });

        res.json({ hasVoted: user ? user.hasVoted : false });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error checking voting status", error });
    }
});

// ✅ Get Total Registered Voters
app.get("/registered-voters", async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching voter count", error });
    }
});

// ✅ Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

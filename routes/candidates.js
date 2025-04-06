const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

// Route to get candidates based on department & category
router.get("/candidates", async (req, res) => {
    try {
        const { department, category } = req.query;

        if (!department || !category) {
            return res.status(400).json({ message: "Department and category are required" });
        }

        const candidates = await Candidate.find({ department, category });

        res.json(candidates);
    } catch (error) {
        console.error("Error fetching candidates:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

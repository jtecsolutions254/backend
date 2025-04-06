const express = require("express");
const { castVote, getResults } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/vote", authMiddleware, castVote);
router.get("/results", getResults);

module.exports = router;

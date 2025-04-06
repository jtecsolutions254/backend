const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

module.exports = mongoose.model("Candidate", CandidateSchema);

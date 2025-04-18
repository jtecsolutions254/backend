const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    hasVoted: { type: Boolean, default: false },
    votedCandidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", default: null }
});

module.exports = mongoose.model("User", UserSchema);

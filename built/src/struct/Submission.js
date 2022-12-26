import mongoose from 'mongoose';
const Submission = mongoose.model('Submission', new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        minlength: 18,
    },
    guildId: String,
    submissionType: String,
    userId: String,
    pointsTotal: Number,
    collaborators: Number,
    bonus: Number,
    edit: Boolean,
    size: Number,
    quality: Number,
    sqm: Number,
    complexity: Number,
    smallAmt: Number,
    mediumAmt: Number,
    largeAmt: Number,
    roadType: Number,
    roadKMs: Number,
    submissionTime: Number,
    reviewTime: Number,
    reviewer: String,
    feedback: { type: String, maxlength: 1700 },
}));
export default Submission;

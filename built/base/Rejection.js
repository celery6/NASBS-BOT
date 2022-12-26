import mongoose from 'mongoose';
const Rejection = mongoose.model('Rejection', new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        minlength: 18,
    },
    guildId: String,
    userId: String,
    submissionTime: Number,
    reviewTime: Number,
    reviewer: String,
    feedback: { type: String, maxlength: 1700 },
}));
export { Rejection };

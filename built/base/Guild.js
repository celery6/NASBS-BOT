import mongoose from 'mongoose';
const Guild = mongoose.model('Guild', new mongoose.Schema({
    id: String,
    emoji: String,
    name: String,
    submitChannel: String,
    formattingMsg: String,
    reviewerRole: String,
    rank1: { id: String, points: Number, name: String },
    rank2: { id: String, points: Number, name: String },
    rank3: { id: String, points: Number, name: String },
    rank4: { id: String, points: Number, name: String },
}));
export { Guild };

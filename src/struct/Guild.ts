import mongoose from 'mongoose'

const Guild = mongoose.model<GuildInterface>(
    'Guild',
    new mongoose.Schema<GuildInterface>({
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
        rank5: { id: String, points: Number, name: String }
    })
)

export interface GuildInterface {
    id: string
    emoji: string
    name: string
    submitChannel: string
    formattingMsg: string
    reviewerRole: string
    rank1: Rank
    rank2: Rank
    rank3: Rank
    rank4: Rank
    rank5: Rank
}

interface Rank {
    id: string
    points: number
    name: string
}

export default Guild

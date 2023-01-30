import mongoose from 'mongoose'

const User = mongoose.model<UserInterface>(
    'User',
    new mongoose.Schema<UserInterface>({
        id: String,
        guildId: String,
        dm: Boolean,
        pointsTotal: Number,
        buildingCount: Number,
        roadKMs: Number,
        sqm: Number
    })
)

export interface UserInterface {
    id: string
    guildId: string
    dm: boolean
    pointsTotal: number
    buildingCount: number
    roadKMs: number
    sqm: number
}

export default User

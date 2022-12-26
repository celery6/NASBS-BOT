import mongoose from 'mongoose'

const Submission = mongoose.model<SubmissionInterface>(
  'Submission',
  new mongoose.Schema<SubmissionInterface>({
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
  }),
)

export interface SubmissionInterface {
  _id: string
  guildId: string
  userId: string
  pointsTotal?: number
  complexity?: number
  quality?: number
  submissionType?: string
  collaborators?: number
  bonus?: number
  edit?: boolean
  size?: number
  sqm?: number
  smallAmt?: number
  mediumAmt?: number
  largeAmt?: number
  roadType?: number
  roadKMs?: number
  submissionTime: number
  reviewTime: number
  reviewer: string
  feedback: string
}

export default Submission

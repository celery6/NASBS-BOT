import mongoose from 'mongoose'

const Rejection = mongoose.model<RejectionInterface>(
  'Rejection',
  new mongoose.Schema<RejectionInterface>({
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
  }),
)

export interface RejectionInterface {
  _id: string
  guildId: string
  userId: string
  submissionTime: number
  reviewTime: number
  reviewer: string
  feedback: string
}

export default Rejection

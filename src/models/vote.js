/**
 * Mongoose model Vote.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema for a vote.
export const voteSchema = new mongoose.Schema({
  comprehensible: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  engaging: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  convincing: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  conversational: {
    type: Boolean,
    required: true
  },
  positive: {
    type: Boolean,
    required: true
  },
  personal: {
    type: Boolean,
    required: true
  },
  writingId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
const Vote = mongoose.model('Vote', voteSchema)
export default Vote

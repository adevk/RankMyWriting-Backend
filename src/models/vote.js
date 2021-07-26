/**
 * Mongoose model Vote.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema for a vote.
const voteSchema = new mongoose.Schema({
  comprehensible: {
    type: Number,
    required: [true, 'A comprehensible score is required.'],
    min: 0,
    max: 5
  },
  engaging: {
    type: Number,
    required: [true, 'A engaging score is required.'],
    min: 0,
    max: 5
  },
  convincing: {
    type: Number,
    required: [true, 'A convincing score is required.'],
    min: 0,
    max: 5
  },
  conversational: {
    type: Boolean,
    required: [true, 'You must choose a FORMAL/CONVERSATIONAL tone.']
  },
  positive: {
    type: Boolean,
    required: [true, 'You must choose a NEGATIVE/POSITIVE tone.']
  },
  personal: {
    type: Boolean,
    required: [true, 'You must choose a IMPERSONAL/PERSONAL tone.']
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

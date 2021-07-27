/**
 * Mongoose model Writing.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema for a writing.
const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'A title for the writing is required.']
  },
  text: {
    type: String,
    required: [true, 'A text for the writing is required.']
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  },
  score: {
    comprehensible: {
      type: Number,
      required: [true, 'A comprehensible score is required.'],
      min: 0,
      max: 5,
      default: 0
    },
    engaging: {
      type: Number,
      required: [true, 'A engaging score is required.'],
      min: 0,
      max: 5,
      default: 0
    },
    convincing: {
      type: Number,
      required: [true, 'A convincing score is required.'],
      min: 0,
      max: 5,
      default: 0
    }
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
const Writing = mongoose.model('Writing', schema)
export default Writing

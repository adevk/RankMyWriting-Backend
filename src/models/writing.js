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
  active: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
const Writing = mongoose.model('Writing', schema)
export default Writing

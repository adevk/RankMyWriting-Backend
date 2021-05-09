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
    required: true
  },
  text: {
    type: String,
    required: true
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

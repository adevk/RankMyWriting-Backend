/**
 * Mongoose model Text.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  }
}, {
  timestamps: true
})

// Create a model using the schema.
const Text = mongoose.model('Text', schema)
export default Text

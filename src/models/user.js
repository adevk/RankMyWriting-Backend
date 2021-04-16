/**
 * Mongoose model User.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Create a schema for a user account.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'The password must consist of at least 8 characters.']
  }
}, {
  timestamps: true,
  versionKey: false
})

/**
 * Authenticates a user.
 *
 * @param {string} username - Express request object.
 * @param {string} password - Express response object.
 * @returns {object} user from db.
 */
schema.statics.authenticate = async function (username, password) {
  const user = await User.findOne({ username })

  // If user was not found or password was incorrect, throw an error.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login credentials.')
  }
  // If the login attempt was successful, return the user.
  return user
}

// Salt and hash passwords before saving to db.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

// Create a model using the schema.
export const User = mongoose.model('User', schema)

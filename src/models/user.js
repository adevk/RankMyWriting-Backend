/**
 * Mongoose model User.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Create a schema for a user account.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'A username is required.'],
    unique: [true, 'The username is already taken.'],
    trim: true,
    maxlength: [100, 'The username is not allowed to consist of more than 100 characters.']
  },
  password: {
    type: String,
    required: [true, 'A password is required.'],
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
  const dbUser = await User.findOne({ username })

  // If user was not found or password was incorrect, throw an error.
  if (!dbUser || !(await bcrypt.compare(password, dbUser.password))) {
    throw new Error('Invalid login credentials.')
  }
  // If the login attempt was successful, return the user.
  return dbUser
}

/**
 * Generates a signed JWT token for a user.
 *
 * @returns {string} the JWT string.
 */
schema.methods.generateSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

// Salt and hash passwords before saving to db.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

// Create a model using the schema.
const User = mongoose.model('User', schema)
export default User

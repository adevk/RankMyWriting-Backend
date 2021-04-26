import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { app } from '../src/server.js'
import User from '../src/models/user.js'
import jwt from 'jsonwebtoken'

const request = supertest(app)

const databaseName = 'test'

describe('Registration endpoint', () => {
  beforeEach(async () => {
    const mongoURI = `mongodb://localhost:27017/${databaseName}`
    await mongoose.connect(mongoURI, { useNewUrlParser: true })
  })

  afterEach(async () => {
    // Removes all created users.
    await User.deleteMany()
    // Closes the Mongoose connection.
    await mongoose.connection.close()
  })

  it('registers a new user in database', async () => {
    const username = 'Danny'
    const password = '11111111'

    // Send request to create user.
    await request.post('/register')
      .send({ username: username, password: password })
      .expect('Content-Type', /json/)
      .expect(201, { message: 'Account created successfully.' })

    const dbUser = await User.findOne({ username })
    expect(dbUser._id).toBeTruthy()

    // Send request to create duplicate user (should fail).
    const otherPassword = '22222222'
    await request.post('/register')
      .send({ username: username, password: otherPassword })
      .expect('Content-Type', /json/)
      .expect(400)

    const userCount = await User.count()
    expect(userCount).toBe(1)
  })

  it('does not register user with short password', async () => {
    const username = 'Vdra#'
    const password = '1111111'

    // Send request to create user.
    await request.post('/register')
      .send({ username: username, password: password })
      .expect('Content-Type', /json/)
      .expect(400, { message: 'User validation failed: password: The password must consist of at least 8 characters.' })

    expect(await User.count()).toBe(0)
  })

  it('does not register user with invalid data', async () => {
    const username = 'Benjamin'
    const password = '11111114233'

    // Send request to create user.
    await request.post('/register')
      .send({ username: username })
      .expect('Content-Type', /json/)
      .expect(400)

    await request.post('/register')
      .send({ password: password })
      .expect('Content-Type', /json/)
      .expect(400)

    await request.post('/register')
      .send({ username: '', password: '' })
      .expect('Content-Type', /json/)
      .expect(400)

    expect(await User.count()).toBe(0)
  })
})

describe('Login endpoint', () => {
  beforeEach(async () => {
    const mongoURI = `mongodb://localhost:27017/${databaseName}`
    await mongoose.connect(mongoURI, { useNewUrlParser: true })
  })

  afterEach(async () => {
    // Removes all created users.
    await User.deleteMany()
    // Closes the Mongoose connection.
    await mongoose.connection.close()
  })

  it('logs in user with valid data', async () => {
    // For JWT generation.
    process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
    process.env.JWT_EXPIRE = '86400'

    const username = 'Manny'
    const password = '798#5p987oeu'

    // Initiate db with a user to login with.
    const user = new User({
      username: username,
      password: password
    })
    await user.save()

    const response = await request.post('/login')
      .send({ username: username, password: password })
      .expect('Content-Type', /json/)
      .expect(200)

    const token = response.body.token
    expect(jwt.verify(token, process.env.JWT_SECRET)).toBeTruthy()
  })

  it('does not log in user with invalid data', async () => {
    // For JWT generation.
    process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
    process.env.JWT_EXPIRE = '86400'

    const username = 'Manny'
    const password = '798#5p987oeu'

    // Initiate db with a user to login with.
    const user = new User({
      username: username,
      password: password
    })
    await user.save()

    // Send request to create user.
    let response
    response = await request.post('/login')
      .send({ username: username })
      .expect('Content-Type', /json/)
      .expect(401)
    expect(response.body.token).toBeFalsy()

    response = await request.post('/login')
      .send({ password: password })
      .expect('Content-Type', /json/)
      .expect(401)
    expect(response.body.token).toBeFalsy()

    response = await request.post('/login')
      .send({ username: '', password: '' })
      .expect('Content-Type', /json/)
      .expect(401)
    expect(response.body.token).toBeFalsy()

    response = await request.post('/login')
      .expect('Content-Type', /json/)
      .expect(401)
    expect(response.body.token).toBeFalsy()
  })
})

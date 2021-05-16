/**
 * Module for connecting to in-memory mongoDB, for testing purposes.
 *
 * Note: MongoMemoryServer only works with commonJS syntax.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongoServer = new MongoMemoryServer()

mongoose.Promise = Promise

/**
 * Connects in-memory database.
 */
module.exports.connect = async () => {
  // Bind connection to events (to get notifications).
  mongoose.connection.on('connected', () => console.log('Mongoose connection is open.'))
  mongoose.connection.on('error', err => console.error(`Mongoose connection error has occurred: ${err}`))
  mongoose.connection.on('disconnected', () => console.log('Mongoose connection is disconnected.'))

  // If the Node process ends, close the Mongoose connection.
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose connection is disconnected due to application termination.')
      process.exit(0)
    })
  })

  const connectionUri = await mongoServer.getUri()
  const mongooseOpts = {
    // options for mongoose 4.11.3 and above
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  }
  mongoose.connect(connectionUri, mongooseOpts)
}

/**
 *  Disconnects in-memory database.
 */
module.exports.disconnect = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

/**
 * Clears database.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}

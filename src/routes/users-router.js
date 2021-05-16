import express from 'express'
import UsersController from '../controllers/users-controller.js'

const usersRouter = express.Router()

const usersController = new UsersController()

usersRouter.post('/register', (req, res, next) => usersController.registerUser(req, res, next))
usersRouter.post('/login', (req, res, next) => usersController.signInUser(req, res, next))

export default usersRouter

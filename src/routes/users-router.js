import express from 'express'
import UsersController from '../controllers/users-controller.js'
import authorize from '../middleware/auth.js'

const usersRouter = express.Router()

const usersController = new UsersController()

usersRouter.post('/register', (req, res, next) => usersController.registerUser(req, res, next))
usersRouter.delete('/delete', authorize, (req, res, next) => usersController.deleteUser(req, res, next))
usersRouter.post('/login', (req, res, next) => usersController.signInUser(req, res, next))

export default usersRouter

import express from 'express'
import authorize from '../middleware/auth.js'
import HomeController from '../controllers/home-controller.js'

const homeRouter = express.Router()

const homeController = new HomeController()

homeRouter.get('/dashboard', authorize, (req, res, next) => homeController.dashboard(req, res, next))

export default homeRouter

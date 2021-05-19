import express from 'express'
import WritingsController from '../controllers/writings-controller.js'
import authorize from '../middleware/auth.js'

const writingsRouter = express.Router()

const writingsController = new WritingsController()

writingsRouter.post('/create', authorize, (req, res, next) => writingsController.createWriting(req, res, next))
writingsRouter.get('/retrieve', authorize, (req, res, next) => writingsController.retriveWritings(req, res, next))

export default writingsRouter

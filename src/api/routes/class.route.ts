import express from 'express'
import * as ClassController from '../controllers/class.controller'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'
const router = express.Router()

router.post('/classes', checkAuthenticated, checkIsHeadmaster, ClassController.createClass)
router.patch('/classes/:id', checkAuthenticated, checkIsHeadmaster, ClassController.updateClass)
router.delete('/classes/:id', checkAuthenticated, checkIsHeadmaster, ClassController.removeClass)
router.get('/classes/trash', checkAuthenticated, checkIsHeadmaster, ClassController.getClassTrash)
router.get('/classes', checkAuthenticated, ClassController.getClasses)
router.get('/classes/:id', checkAuthenticated, checkIsTeacher, ClassController.getOneClass)

export default router

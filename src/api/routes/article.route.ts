import express from 'express'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'
const router = express.Router()

// router.post('/article', checkAuthenticated, checkIsHeadmaster)
// router.patch('/article/:id', checkAuthenticated, checkIsHeadmaster)
// router.delete('/article/:id', checkAuthenticated, checkIsHeadmaster )
// router.get('/article', checkAuthenticated)
// router.get('/article/:id', checkAuthenticated)

export default router

import express from 'express'
import {
	createStudent,
	updateStudent,
	getStudentsByClass,
	getStudentDetail,
	serviceStudent,
	getStudentLeftSchool,
	getPolicyBeneficiary,
	getStudentsByParents,
	promoteStudentsByClass
} from '../controllers/student.controller'
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware'

const router = express.Router()

router.get('/students/children-of-parents', checkAuthenticated, getStudentsByParents)
router.get('/students/policy-beneficiary', checkAuthenticated, checkIsHeadmaster, getPolicyBeneficiary)
router.get('/students/left-school', checkAuthenticated, checkIsTeacher, getStudentLeftSchool)
router.get('/students/detail/:id', checkAuthenticated, getStudentDetail)
router.get('/students/:classId', checkAuthenticated, checkIsTeacher, getStudentsByClass)
router.patch('/students/graduation-promote/:classId', checkAuthenticated, checkIsHeadmaster, promoteStudentsByClass)
router.post('/students', checkAuthenticated, checkIsHeadmaster, createStudent)
router.patch('/students/services/:id', checkAuthenticated, serviceStudent)
router.patch('/students/:id', checkAuthenticated, checkIsHeadmaster, updateStudent)

export default router

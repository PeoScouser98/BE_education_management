import express from 'express';
import { createStudent } from '../controllers/student.controller';

const router = express.Router();

router.post('/students', createStudent);

export default router;

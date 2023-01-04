import express from "express";
import { list, create } from "../controllers/student.controller";

const router = express.Router();

router.get("/students/:classId", list);
router.post("/students", create);

export default router;

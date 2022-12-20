import express from "express";
import { list } from "../controllers/student.controller";

const router = express.Router();

router.get("/students", list);

export default router;

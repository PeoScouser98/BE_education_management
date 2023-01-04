import express from "express";
import * as eduBackgroundController from "../controllers/eduBackground.controller";

const router = express.Router();

router.get("/eduBackground", eduBackgroundController.list);
router.post("/eduBackground", eduBackgroundController.create);
router.put("/eduBackground/:id", eduBackgroundController.update);
router.delete("/eduBackground/:id", eduBackgroundController.remove);

export default router;

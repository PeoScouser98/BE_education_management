import express from "express";
import * as eduBackgroundController from "../controllers/eduBackground.controller";

const router = express.Router();

router.get("/get-all", eduBackgroundController.list);
router.post("/create", eduBackgroundController.create);
router.put("/update/:eduBackgroundId", eduBackgroundController.update);
router.delete("/delete/:eduBackgroundId", eduBackgroundController.remove);

export default router;

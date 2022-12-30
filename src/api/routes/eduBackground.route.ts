import express from 'express';
import * as eduBackgroundController from '../controllers/eduBackground.controller';

const router = express.Router();

router.get('/education-background', eduBackgroundController.list);
router.post('/education-background', eduBackgroundController.create);
router.put('/education-background/:eduBackgroundId', eduBackgroundController.update);
router.delete('/education-background/:eduBackgroundId', eduBackgroundController.remove);

export default router;

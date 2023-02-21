import { Request, Response } from "express";
import createHttpError from "http-errors";
import * as EduBackgroundServices from "../services/eduBackground.service";

export const list = async (req: Request, res: Response) => {
    try {
        const eduBackgrounds = await EduBackgroundServices.getAll();
        if (!eduBackgrounds) throw createHttpError.NotFound("Cannot find any education background!");
        res.status(200).json(eduBackgrounds);
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newEduBackground = await EduBackgroundServices.create(req.body);
        console.log("New Education background :", newEduBackground);
        res.status(200).json(newEduBackground);
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const eduBackgroundId: string = req.params.eduBackgroundId;
        if (eduBackgroundId) {
            const newEduBackground = await EduBackgroundServices.edit(req.body, eduBackgroundId);
            console.log("New Education background :", newEduBackground);
            res.status(200).json({
                message: "Update education bacground successfully!",
            });
        } else {
            throw createHttpError.NotFound("Page not found!");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const eduBackgroundId: string = req.params.eduBackgroundId;
        if (eduBackgroundId) {
            await EduBackgroundServices.remove(eduBackgroundId);
            res.status(200).json({
                message: "Delete education bacground successfully!",
            });
        } else {
            throw createHttpError.NotFound("Page not found!");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

/**
 * @swagger
 * /api/education-background:
 *   get:
 *     description: Returns education background
 *     responses:
 *       200:
 *         description: Success
 * 	 post:
 * 		description: Create new education background
 */

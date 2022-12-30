import {Request, Response} from 'express';
import HttpError from 'http-errors';
import * as EduBackgroundService from '../services/eduBackground.service';

export const list = async (req: Request, res: Response) => {
    try {
        const eduBackgrounds = await EduBackgroundService.getAll();
        if (!eduBackgrounds) throw HttpError.NotFound('Cannot find any education background!');
        res.status(200).json(eduBackgrounds);
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newEduBackground = await EduBackgroundService.create(req.body);
        console.log('New Education background :', newEduBackground);
        res.status(200).json(newEduBackground);
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const eduBackgroundId: string = req.params.eduBackgroundId;
        if (eduBackgroundId) {
            const newEduBackground = await EduBackgroundService.edit(req.body, eduBackgroundId);
            console.log('New Education background :', newEduBackground);
            res.status(200).json({
                message: 'Update education bacground successfully!',
            });
        } else {
            throw HttpError.NotFound('Page not found!');
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const eduBackgroundId: string = req.params.eduBackgroundId;
        if (eduBackgroundId) {
            await EduBackgroundService.remove(eduBackgroundId);
            res.status(200).json({
                message: 'Delete education bacground successfully!',
            });
        } else {
            throw HttpError.NotFound('Page not found!');
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

// // 
// export const sortRemove = async (req: Request, res: Response) => {
//     try {
//         const eduBackgroundId: string = req.params.eduBackgroundId;
//         if (eduBackgroundId) {
//             await EduBackgroundService.remove(eduBackgroundId);
//             res.status(200).json({
//                 message: 'Delete education bacground successfully!',
//             });
//         } else {
//             throw HttpError.NotFound('Page not found!');
//         }
//     } catch (error) {
//         return res.status(500).json(error);
//     }
// };

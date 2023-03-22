import { Request, Response } from 'express';
import HttpError from 'http-errors';
import * as schoolYearServices from '../services/schoolYear.service';

export const list = async (req: Request, res: Response) => {
	try {
		const limit = req.query.limit ? req.query.limit : 10;
		const currPage = req.query.page ? req.query.page : 1;
		const data = await schoolYearServices.getAll(limit as number, currPage as number);
		if (!data.schoolYears) throw new HttpError.NotFound('Cannot find any school year!');
		return res.status(200).json({
			schoolYears: data.schoolYears,
			pages: data.pages,
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newSchoolYear = await schoolYearServices.create(req.body);
		console.log('New school year', newSchoolYear);
		return res.status(200).json(newSchoolYear);
	} catch (error) {
		return res.status(500).json(error);
	}
};

export const update = async (req: Request, res: Response) => {
	try {
		const schoolYearId = req.params.schoolYearId;
		if (schoolYearId) {
			const newSchoolYear = await schoolYearServices.update(req.body, schoolYearId);
			console.log('New school year', newSchoolYear);
			return res.status(200).json({
				message: 'Update school year successfully!',
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
		const schoolYearId = req.params.schoolYearId;
		if (schoolYearId) {
			await schoolYearServices.remove(schoolYearId);
			return res.status(200).json({
				message: 'Delete school year successfully!',
			});
		} else {
			throw HttpError.NotFound('Page not found!');
		}
	} catch (error) {
		return res.status(500).json(error);
	}
};

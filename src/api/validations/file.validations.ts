import { AllowedMimeType } from '../../types/mimeType.type';

export const checkValidMimeType = (file: File) => {
	const allowedMimeType = Object.values(AllowedMimeType) as Array<string>;
	return allowedMimeType.includes(file.mimetype);
};

import 'dotenv/config';
import { drive_v3, google } from 'googleapis';
import { Stream } from 'stream';
import { drive } from '../../configs/googleApis.config';

// Creates a permission for a file or shared drive.
const setFilePublic = async (fileId: string) => {
	try {
		await drive.permissions.create({
			fileId,
			requestBody: {
				role: 'reader',
				type: 'anyone',
			},
		});
		return drive.files.get({
			fileId,
			fields: 'webViewLink, webContentLink',
		});
	} catch (error) {
		console.log(error);
	}
};

export const uploadFile = async (
	file: Express.Multer.File,
	dir: string = process.env.FOLDER_ID!
) => {
	try {
		/* tạo nơi lưu trữ file tạm thời (buffer) -> file sẽ được upload qua stream */
		const bufferStream = new Stream.PassThrough();
		bufferStream.end(file.buffer);
		const createdFile = await drive.files.create({
			requestBody: {
				name: file.originalname,
				parents: [dir],
			},
			media: {
				body: bufferStream,
				/* file được upload lấy từ buffer đã được lưu trữ tạm thời trước đó */
			},
			fields: 'id',
		} as drive_v3.Params$Resource$Files$Create);
		console.log(createdFile);
		await setFilePublic(createdFile.data.id as string);
		return createdFile;
	} catch (error) {
		throw error as Error;
	}
};

export const deleteFile = async (fileId: string) => {
	try {
		return await drive.files.delete({ fileId });
	} catch (error) {
		return Promise.resolve(error); // inore error after delete file on google drive successfully
	}
};

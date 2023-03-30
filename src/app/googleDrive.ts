import 'dotenv/config';
import { Request, Response } from 'express';
import { drive_v3, google } from 'googleapis';
import { Stream } from 'stream';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_REFRESH_TOKEN, REDIRECT_URI } =
	process.env;

let accessToken: string | undefined;
const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

oauth2Client
	.getAccessToken()
	.then((response) => {
		console.log(response);
	})
	.catch((error) => {
		console.log('[ERROR]', error.message);
	});

oauth2Client.setCredentials({
	refresh_token: GOOGLE_API_REFRESH_TOKEN!,
});

const drive: drive_v3.Drive = google.drive({
	version: 'v3',
	auth: oauth2Client,
});

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

export const uploadFile = async (file: File, dir: string = process.env.FOLDER_ID!) => {
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
		console.log((error as Error).message);
	}
};

export const deleteFile = async (req: Request, res: Response) => {
	try {
		const removedFile = await drive.files.delete(req.body.fileId);
		res.status(204).json(removedFile);
	} catch (error) {
		res.status(400).json({
			message: 'Không xóa được file',
		});
	}
};

// export const createFolder = async (folderName: string) => {
// 	const fileMetadata = {
// 		name: folderName,
// 		mimeType: 'application/vnd.google-apps.folder',
// 	} as Partial<drive_v3.Params$Resource$Files$Create>;

// 	try {
// 		const file = await driveService.files.create({
// 			resource: fileMetadata,
// 			fields: 'id',
// 		});
// 		console.log('Folder Id:', file.data.id);
// 		return file.data.id;
// 	} catch (err) {
// 		// TODO(developer) - Handle error
// 		throw err;
// 	}
// };

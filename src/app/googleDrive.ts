import 'dotenv/config';
import { Request, Response } from 'express';
import { Credentials } from 'google-auth-library';
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { drive_v3, google } from 'googleapis';
import { Stream } from 'stream';
import { GoogleAuth } from 'google-auth-library';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_REFRESH_TOKEN, REDIRECT_URI } =
	process.env;

let accessToken: string | undefined;
const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

oauth2Client.getAccessToken().then(({ token }) => {
	accessToken = token as string;
});

oauth2Client.setCredentials({
	access_token: accessToken,
	refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN,
});

const driveService: drive_v3.Drive = google.drive({
	version: 'v3',
	auth: accessToken as string,
});

const setFilePublic = async (fileId: string) => {
	try {
		await driveService.permissions.create({
			fileId,
			requestBody: {
				role: 'reader',
				type: 'anyone',
			},
		});
		return driveService.files.get({
			fileId,
			fields: 'webViewLink, webContentLink',
		});
	} catch (error) {
		console.log(error);
	}
};

export const uploadFile = async (file: File, dir: string) => {
	try {
		/* tạo nơi lưu trữ file tạm thời (buffer) -> file sẽ được upload qua stream */
		const bufferStream = new Stream.PassThrough();
		bufferStream.end(file.buffer);
		const createdFile = await driveService.files.create({
			requestBody: {
				name: file.originalname,
				parents: [process.env.FOLDER_ID],
			},
			media: {
				body: bufferStream,
				/* file được upload lấy từ buffer đã được lưu trữ tạm thời trước đó */
			},
			fields: 'id',
		} as drive_v3.Params$Resource$Files$Create);
		await setFilePublic((createdFile as drive_v3.Schema$File).id as string);
		return createdFile;
	} catch (error) {
		console.log(error);
	}
};

export const deleteFile = async (req: Request, res: Response) => {
	try {
		const removedFile = await driveService.files.delete(req.body.fileId);
		res.status(204).json(removedFile);
	} catch (error) {
		res.status(400).json({
			message: 'Không xóa được file',
		});
	}
};

export const createFolder = async (folderName: string) => {
	const fileMetadata = {
		name: folderName,
		mimeType: 'application/vnd.google-apps.folder',
	} as Partial<drive_v3.Params$Resource$Files$Create>;

	try {
		const file = await driveService.files.create({
			resource: fileMetadata,
			fields: 'id',
		});
		console.log('Folder Id:', file.data.id);
		return file.data.id;
	} catch (err) {
		// TODO(developer) - Handle error
		throw err;
	}
};

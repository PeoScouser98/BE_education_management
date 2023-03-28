import { drive_v3, google } from 'googleapis';
import { Readable, Stream } from 'stream';
import 'dotenv/config';
import { Request, Response } from 'express';

export interface File {
	/** Name of the form field associated with this file. */
	fieldname: string;
	/** Name of the file on the uploader's computer. */
	originalname: string;
	/**
	 * Value of the `Content-Transfer-Encoding` header for this file.
	 * @deprecated since July 2015
	 * @see RFC 7578, Section 4.7
	 */
	encoding: string;
	/** Value of the `Content-Type` header for this file. */
	mimetype: string;
	/** Size of the file in bytes. */
	size: number;
	/**
	 * A readable stream of this file. Only available to the `_handleFile`
	 * callback for custom `StorageEngine`s.
	 */
	stream: Readable;
	/** `DiskStorage` only: Directory to which this file has been uploaded. */
	destination: string;
	/** `DiskStorage` only: Name of this file within `destination`. */
	filename: string;
	/** `DiskStorage` only: Full path to the uploaded file. */
	path: string;
	/** `MemoryStorage` only: A Buffer containing the entire file. */
	buffer: Buffer;
}

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_REFRESH_TOKEN, REDIRECT_URI } =
	process.env;

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: GOOGLE_API_REFRESH_TOKEN });

oauth2Client
	.getAccessToken()
	.then(({ res }) => {
		process.env.GOOGLE_API_ACCESS_TOKEN = res?.data['access_token'];
	})
	.catch((error) => {
		console.log((error as Error).message);
	});

const drive = google.drive({
	version: 'v3',
	auth: process.env.GOOGLE_API_ACCESS_TOKEN,
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

export const uploadFile = async (file: File, dir: string) => {
	try {
		/* tạo nơi lưu trữ file tạm thời (buffer) -> file sẽ được upload qua stream */
		const bufferStream = new Stream.PassThrough();
		bufferStream.end(file.buffer);
		const createdFile = await drive.files.create({
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
		const removedFile = await drive.files.delete(req.body.fileId);
		res.status(204).json(removedFile);
	} catch (error) {
		res.status(400).json({
			message: 'Không xóa được file',
		});
	}
};

import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../configs/nodemailer.config';
import createHttpError from 'http-errors';

export const sendVerificationEmail = async ({
	to,
	subject,
	template
}: {
	to: string;
	subject: string;
	template: string;
}) =>
	await transporter.sendMail(
		{
			from: {
				address: process.env.AUTH_EMAIL!,
				name: 'Tiểu học Bột Xuyên'
			},
			to: to,
			subject: subject,
			html: template
		},
		(err: Error | null, info: SMTPTransport.SentMessageInfo): void => {
			console.log('recipient:>>>', to);
			console.log('err:>>>', err);
			if (err) throw createHttpError.InternalServerError('Failed to send mail');
			else console.log(info.response);
		}
	);

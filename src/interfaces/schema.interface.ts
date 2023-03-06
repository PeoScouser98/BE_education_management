export interface User {
	email: string;
	fullName: string;
	password: string;
	photoUrl: string;
	phone: string;
	authenticate: (password: string) => boolean;
	encryptPassword: (password: string) => string;
}

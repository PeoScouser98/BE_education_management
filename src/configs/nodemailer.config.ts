import nodemailer from "nodemailer";
import "dotenv/config";

const nodemailerConfig = {
	service: "gmail",
	port: 465,
	auth: {
		user: process.env.ADMIN_EMAIL,
		password: process.env.ADMIN_PASSWORD,
	},
};
export default nodemailerConfig;

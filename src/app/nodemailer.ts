import nodemailer from "nodemailer";
import nodemailerConfig from "../configs/nodemailer.config";

const transporter = nodemailer.createTransport(nodemailerConfig);
export default transporter;

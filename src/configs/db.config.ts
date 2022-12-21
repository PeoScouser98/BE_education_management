import mongoose, { MongooseError } from "mongoose";
import "dotenv/config";
const connectMongoDB = async () => {
	try {
		const databaseUri = process.env.NODE_ENV == "production" ? process.env.DB_URI! : process.env.LOCAL_DB_URI!;
		mongoose.set("strictQuery", true);
		await mongoose.connect(databaseUri);
		console.log("Connected to database");
	} catch (error: MongooseError | any) {
		console.log(error.message);
	}
};

export default connectMongoDB;

import mongoose, { MongooseError } from "mongoose";
import "dotenv/config";
const connectMongoDB = async () => {
	try {
		const isProductionEnv = process.env.NODE_ENV?.indexOf("production") !== -1;
		const databaseUri = isProductionEnv ? process.env.DB_URI! : process.env.LOCAL_DB_URI!;
		mongoose.set("strictQuery", true);
		const data = await mongoose.connect(databaseUri);
		console.log("::::::::::: Connected to database :::::::::::");
		return data;
	} catch (error) {
		console.log(error as MongooseError);
	}
};

export default connectMongoDB;

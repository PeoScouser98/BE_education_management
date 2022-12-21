import mongoose, { MongooseError } from "mongoose";
import ip from "ip";
import "dotenv/config";
const connectMongoDB = async () => {
	try {
		const isProductionEnv = process.env.NODE_ENV?.indexOf("production") != -1;
		console.log("Node ENV:>>", isProductionEnv);
		const databaseUri = isProductionEnv ? process.env.DB_URI! : process.env.LOCAL_DB_URI!;
		mongoose.set("strictQuery", true);
		await mongoose.connect(databaseUri);
		console.log("Connected to database");
	} catch (error: MongooseError | any) {
		console.log(error.message);
	}
};

export default connectMongoDB;

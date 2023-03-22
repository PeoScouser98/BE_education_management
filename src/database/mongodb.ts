import mongoose, { MongooseError } from 'mongoose';
import 'dotenv/config';
const connectMongoDB = async () => {
	try {
		mongoose.set('strictQuery', false);
		const isProductionEnv = process.env.NODE_ENV?.includes('production');
		isProductionEnv
			? console.log('[INFO] ::: Production Mode!')
			: console.log('[INFO] ::: Development Mode!');
		const databaseUri = isProductionEnv
			? process.env.REMOTE_DB_URI!
			: process.env.LOCAL_DB_URI!;
		const data = await mongoose.connect(databaseUri);
		console.log('[SUCCESS] ::: Connected to database');
		return data;
	} catch (error) {
		console.log('[ERROR] ::: ', (error as MongooseError).message);
	}
};

export default connectMongoDB;

import 'dotenv/config';

export default {
	CLIENT_URL: process.env.NODE_ENV?.includes('production')
		? process.env.FRONTEND_URL!
		: process.env.LOCAL_FRONTEND_URL!,
};

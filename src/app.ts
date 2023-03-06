import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import studentRouter from './api/routes/student.route';
import swaggerSpec from './configs/swagger.config';
import headmasterRouter from './api/routes/headmaster.route';
const app = express();

/**
 * @description: Using middlewares
 */
app.use(express.json()); // for parsing  application/json
app.use(helmet()); // secure api
app.use(cookieParser()); // reading cookie of request
app.use(morgan('tiny')); // logging request/response
app.use(
	cors({
		origin: '*',
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
		allowedHeaders: ['token'],
	})
);

/**
 * @description: Using apis routes
 */
app.use('/api', studentRouter);
app.use('/api', headmasterRouter);

/**
 * @description: Using apis routes
 */
app.get('/', async (req: Request, res: Response) => {
	return res.status(200).json({
		message: 'Server now is running!',
		status: 200,
	});
});
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default app;

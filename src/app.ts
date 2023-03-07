// libraries
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
// swagger
import swaggerUI from 'swagger-ui-express';
import swaggerOptions from './configs/swagger.config';
// routers
import headmasterRouter from './api/routes/headmaster.route';
import studentRouter from './api/routes/student.route';
import teacherRouter from './api/routes/teacher.route';

/**
 * @description Express app
 * @type Express
 */
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
 * @description Using apis routes
 */
app.use('/api', studentRouter);
app.use('/api', headmasterRouter);
app.use('/api', teacherRouter);

/**
 * @description APIs document
 */

app.use('/api/document', swaggerUI.serve, swaggerUI.setup(swaggerOptions));

/**
 * @description Default reponse
 */
app.get('/', async (req: Request, res: Response) => {
	return res.status(200).json({
		message: 'Server now is running!',
		status: 200,
	});
});

export default app;

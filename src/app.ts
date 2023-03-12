// libraries
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import session, { MemoryStore } from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import './app/passport';
import 'dotenv/config';
// swagger
import swaggerUI from 'swagger-ui-express';
import swaggerOptions from './configs/swagger.config';
// routers
import rootRouter from './api/routes';

// Initialize Express app
const app = express();

// for parsing application / json
app.use(express.json());

// set security HTTP headers
app.use(helmet());
// logging request/response
app.use(morgan('tiny'));

// use session - cookie
app.use(cookieParser());
app.use(
	session({
		saveUninitialized: false,
		secret: process.env.KEY_SESSION!,
		store: new MemoryStore(),
	})
);

// enable cors
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
	})
);
app.use(passport.initialize());
app.use(passport.session());

// Use routers
app.use('/api', rootRouter);

// Swagger
app.use('/api/document', swaggerUI.serve, swaggerUI.setup(swaggerOptions));

// Default response
app.get('/', async (req: Request, res: Response) => {
	return res.status(200).json({
		message: 'Server now is running!',
		status: 200,
	});
});

export default app;

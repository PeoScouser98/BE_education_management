import { HttpException } from "./types/error.type";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import swaggerUI from "swagger-ui-express";
import yaml from "yamljs";
import path from "path";
import helmet from "helmet";
import { ErrorRequestHandler } from "express-serve-static-core";

import studentRouter from "./api/routes/student.route";
import eduBackgroundRouter from "./api/routes/eduBackground.route";
import schoolYearRouter from "./api/routes/schoolYear.route";

const app = express();
const yamlFile = yaml.load(path.resolve(path.join(__dirname, "/docs.yaml")));

// * Using middlewares
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("tiny"));
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(yamlFile));

// * Using router

app.use("/api", studentRouter);
app.use("/api/education-background", eduBackgroundRouter);

app.get("/", (req, res) => {
	res.json({
		message: "Server now is running!",
	});
});

export default app;

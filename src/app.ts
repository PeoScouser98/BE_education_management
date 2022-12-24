import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import studentRouter from "./routes/student.route";
import swaggerUI from "swagger-ui-express";
import yaml from "yamljs";
import path from "path";

const app = express();

const yamlFile = yaml.load(path.resolve(path.join(__dirname, "/docs.yaml")));

// * Using middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("tiny"));
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(yamlFile));

// * Using router
app.use("/api", studentRouter);

app.get("/", (req, res) => {
	res.json({
		message: "Server now is running!",
	});
});

export default app;

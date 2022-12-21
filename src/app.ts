import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import studentRouter from "./routes/student.route";

const app = express();

// * Using middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("tiny"));

// * Using router
app.use("/api", studentRouter);

app.get("/", (req, res) => {
	res.json({
		message: "Server now is running!",
	});
});

export default app;

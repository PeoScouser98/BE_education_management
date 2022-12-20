import express from "express";
import cors from "cors";
import morgan from "morgan";

import __Student from "./routes/student.route";

const app = express();

// * Using middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// * Using router
app.use("/api", __Student);

app.get("/", (req, res) => {
	res.send("Server now is running!");
});

export default app;

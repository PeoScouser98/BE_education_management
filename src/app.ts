import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import eduBackgroundRouter from "./api/routes/eduBackground.route";
import studentRouter from "./api/routes/student.route";

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "Documentation for all endpoints",
        },
    },
    apis: ["./api/controllers/*.ts"],
});

const app = express();

// * Using middlewares
app.use(express.json());
app.use(helmet());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        allowedHeaders: ["token"],
    }),
);
app.use(morgan("tiny"));

// * Using router
app.use("/api", studentRouter);
app.use("/api/education-background", eduBackgroundRouter);
app.get("/", (req, res) => {
    res.json({
        message: "Server now is running!",
        status: 200,
    });
});
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default app;

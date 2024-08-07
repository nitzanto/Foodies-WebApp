import express, { Express } from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import logger from "@utils/logger";
import applicationRouter from "@routes/application.router";
import connectToDatabase from "@utils/dbConfig";
import cors from "cors";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleSocket } from "./socketHandler"; 
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";


const app: Express = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "StoicReads",
      version: "1.0.1",
      description:
        "REST server including authentication using JWT and refresh token",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://node07.cs.colman.ac.il"
            : "http://localhost:" + process.env.PORT,
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(applicationRouter);
console.log("dirname: " + __dirname);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connectToDatabase()
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });
    handleSocket(io);
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error}`);
  });

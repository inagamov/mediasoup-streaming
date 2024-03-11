import express from "express";
import dotenv from "dotenv"
import fs from "fs";
import https from "https";
import cors from "cors";
import routes from './routes';
import { handleMediasoupCreateWorker, handleMediasoupCreateRouter } from "./utils/mediasoup";
import { initSocketIo, connectSocketIo } from './utils/websockets'

// express app
const index = express();

// .env
dotenv.config()

// init server
const options = {
    cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH as string, "utf8"),
    key: fs.readFileSync(process.env.SSL_CERTIFICATE_KEY_PATH as string, "utf8"),
};
const httpsServer = https.createServer(options, index);

// middlewares
index.use(express.json());
index.use(
    cors({
        origin: process.env.ORIGIN_URL,
        credentials: true,
    }),
);
index.use('/', routes);

// media server worker & router
(async () => {
    await handleMediasoupCreateWorker();
    await handleMediasoupCreateRouter();
})();

// websockets
initSocketIo(httpsServer);
connectSocketIo()

// start the server
httpsServer.listen(8888, "0.0.0.0");

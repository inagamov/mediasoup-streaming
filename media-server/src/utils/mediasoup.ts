// @ts-nocheck
import {createWorker} from "mediasoup";
import store from "../stores";
// import { Worker } from "mediasoup/node/lib/Worker";
// import { Router } from "mediasoup/node/lib/Router";
// import { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";

/**
 * Worker
 * |-> Router(s)
 *     |-> Producer Transport(s)
 *         |-> Producer (video)
 *         |-> Producer (audio)
 *     |-> Consumer Transport(s)
 *         |-> Consumer (video)
 *         |-> Consumer (audio)
 **/

// list of media codecs supported by mediasoup with explicit types
// https://mediasoup.org/documentation/v3/mediasoup/rtp-parameters-and-capabilities/#RtpCodecCapability
// https://github.com/versatica/mediasoup/blob/v3/src/supportedRtpCapabilities.ts
const mediaCodecs = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
            "x-google-start-bitrate": 1000,
        },
    },
];

/*
 * create a worker with explicit return type
 */
export const handleMediasoupCreateWorker = async () => {
    const worker = await createWorker({
        rtcMinPort: 2000,
        rtcMaxPort: 3000,
    });

    worker.on("died", () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
    });

    store.setMediaServerWorker(worker);
};

/*
 * create a router with explicit types for parameters and return type
 */
export const handleMediasoupCreateRouter = async () => {
    const router = await store.getMediaServerWorker().createRouter({ mediaCodecs });
    store.setMediaServerRouter(router);
};

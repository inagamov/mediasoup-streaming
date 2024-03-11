// @ts-nocheck
// todo: rewrite for typescript

import { Stream } from '../models/stream';
import store from '../stores/index';
import { emitToChannel } from "../utils/websockets";
import {WEBSOCKETS_EVENT_OPTIONS} from "../constants/websockets";

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* https://mediasoup.org/documentation/v3/mediasoup/api/ */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// initialize a new map to store streams
export const streams = new Map();

/*
 * POST /stream
 * check if the stream id is already in use, and if not, create a new stream and stores it
 */
export const createStream = async ({ body }, callback) => {
    if (!streams.has(body.id)) {
        const newStream = new Stream(body.id, body.title, body.user);
        streams.set(body.id, newStream);

        callback.json(streams.get(body.id));
    } else {
        callback.status(500).json({ error: "Stream is already in use!" });
    }
};

/*
 * GET /streams
 * get the list of all streams that are not private
 */
export const getStreams = async ({ body }, callback) => {
    const response = [...streams.values()].filter((stream) => !stream.is_private);
    callback.json(response);
};

/*
 * GET /stream/:id
 * retrieve stream data by id
 */
export const getStream = async ({ params }, callback) => {
    if (!streams.has(params.id)) {
        callback.status(404).json({ error: "Stream not found!" });
    }

    const stream = streams.get(params.id);
    callback.json(stream);
}

/*
 * DELETE /stream/:id
 * end (delete) a specific stream by id
 * close all associated transports before removing the stream from the map
 */
export const endStream = async ({ params }, callback) => {
    const stream = streams.get(params.id);
    if (stream) {
        const closeTransport = (transport) => {
            if (transport) {
                transport.close();
            }
        };

        closeTransport(stream.producerTransport.video);
        closeTransport(stream.producerTransport.audio);
        closeTransport(stream.consumerTransport.video);
        closeTransport(stream.consumerTransport.audio);

        streams.delete(params.id);
    }

    callback.json();
}

/*
 * GET /rtp-capabilities
 * get rtp capabilities of the mediasoup router which are essential for setting up WebRTC transports
 */
export const getRtpCapabilities = async ({ body }, callback) => {
    try {
        const rtpCapabilities = store.getMediaServerRouter().rtpCapabilities;

        callback.json({
            rtpCapabilities,
        });
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}

/*
 * POST /web-rtc-transport
 * create and store a WebRTC transport for a stream
 * depending on the request, create either a producer or consumer transport
 */
export const storeWebRtcTransport = async ({ body }, callback) => {
    try {
        const stream = streams.get(body.id);
        const transport = await createWebRtcTransport(callback);

        // check if the transport is for a sender (producer) or receiver (consumer)
        if (body.sender) {
            stream.producerTransport[body.kind] = transport;

            // mark the stream as live and notify all subscribers.
            stream.isLive = true;
            emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_START, { isLive: stream.isLive });
        } else {
            stream.consumerTransport[body.kind] = transport;
        }
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}

// helper function to create a WebRTC transport with mediasoup and configure it
const createWebRtcTransport = async (callback) => {
    try {
        const webRtcTransport_options = {
            listenIps: [
                {
                    // listen on all IPv4 interfaces
                    ip: "0.0.0.0",

                    // public IP to announce for ICE
                    announcedIp: process.env.ANNOUNCED_IP,
                },
            ],
            enableUdp: true, // enable UDP protocol
            enableTcp: true, // enable TCP protocol
            preferUdp: true, // prefer UDP over TCP
        };

        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await store.getMediaServerRouter().createWebRtcTransport(webRtcTransport_options);

        // listen for DTLS state changes and close the transport if the state is "closed"
        transport.on("dtlsstatechange", (dtlsState) => {
            if (dtlsState === "closed") {
                transport.close();
            }
        });

        // listen for transport close event
        transport.on("close", () => {
            console.log("transport closed");
        });

        // respond with transport parameters required for establishing a WebRTC connection
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
        callback.json({
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
        });

        return transport;
    } catch (error) {
        // respond with any errors that occurred during creation
        console.log(error);
        callback.json({
            params: {
                error: error,
            },
        });
    }
};

/*
 * POST /transport-connect
 * connect a WebRTC transport, allowing the stream to start flowing
 * this is necessary after creating the transport and before producing or consuming media
 */
export const transportConnect = async ({ body }, callback) => {
    try {
        if (!streams.has(body.id)) {
            return console.log(`stream "${body.id}" not found`);
        }

        const stream = streams.get(body.id);

        // connect the transport with DTLS parameters provided by the client
        await stream.producerTransport[body.kind].connect({ dtlsParameters: body.dtlsParameters });

        callback.json();
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}

/*
 * POST /transport-produce
 * start producing media (sending media from client to server)
 * create a producer for the specified kind of media (audio or video)
 */
export const transportProduce = async ({ body }, callback) => {
    try {
        if (!streams.has(body.id)) {
            return console.log(`stream "${body.id}" not found`);
        }

        const stream = streams.get(body.id);

        // produce media based on RTP parameters and media kind (audio/video)
        stream.producer[body.kind] = await stream.producerTransport[body.kind].produce({
            kind: body.kind,
            rtpParameters: body.rtpParameters,
        });

        // handle transport close event
        stream.producer[body.kind].on("transportclose", () => {
            stream.producer[body.kind].close();

            // update stream status to not live and finished
            stream.isLive = false;
            stream.isFinished = true;

            // notify subscribers that the stream has ended
            emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_END, {
                isLive: stream.isLive,
                isFinished: stream.isFinished,
            });
        });

        // respond with producer id
        callback.json({
            id: stream.producer[body.kind].id,
        });
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}

/*
 * POST /transport-recv-connect
 * connect a consumer transport, enabling media consumption
 * this step is required before a client can start consuming (receiving) media
 */
export const transportRecvConnect = async ({ body }, callback) => {
    try {
        if (!streams.has(body.id)) {
            return console.log(`stream "${body.id}" not found`);
        }

        const stream = streams.get(body.id);

        // connect the consumer transport with DTLS parameters provided by the client
        await stream.consumerTransport[body.kind].connect({ dtlsParameters: body.dtlsParameters });

        callback.json();
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}

/*
 * POST /consume
 * start consuming media (receiving media from server to client)
 * this involves checking if the router can consume the specified producer and creating a consumer
 */
export const consume = async ({ body }, callback) => {
    try {
        if (!streams.has(body.id)) {
            return console.log(`stream "${body.id}" not found`);
        }

        const stream = streams.get(body.id);

        // check if the router can consume from the specified producer given the RTP capabilities
        if (
            store.getMediaServerRouter().canConsume({
                producerId: stream.producer[body.kind].id,
                rtpCapabilities: body.rtpCapabilities,
            })
        ) {
            // create a consumer for the producer
            // transport can now consume and return a consumer
            stream.consumer[body.kind] = await stream.consumerTransport[body.kind].consume({
                producerId: stream.producer[body.kind].id,
                rtpCapabilities: body.rtpCapabilities,
                paused: true,
            });

            // handle transport and producer close events
            stream.consumer[body.kind].on("transportclose", () => {
                console.log("transport close from consumer");
            });

            stream.consumer[body.kind].on("producerclose", () => {
                console.log("producer of consumer closed");
            });

            // respond with consumer parameters, allowing the client to start receiving media
            callback.json({
                params: {
                    id: stream.consumer[body.kind].id,
                    producerId: stream.producer[body.kind].id,
                    kind: stream.consumer[body.kind].kind,
                    rtpParameters: stream.consumer[body.kind].rtpParameters,
                },
            });
        }
    } catch (error) {
        console.log(error.message);
        callback.json({
            params: {
                error: error,
            },
        });
    }
}

/*
 * POST /consumer-resume
 * resume consuming media after it has been paused
 * this is often used after initial setup or if consumption was interrupted
 */
export const consumerResume = async ({ body }, callback) => {
    try {
        if (!streams.has(body.id)) {
            return console.log(`stream "${body.id}" not found`);
        }

        const stream = streams.get(body.id);

        // resume the consumer, allowing media to flow again
        await stream.consumer[body.kind].resume();

        callback.json();
    } catch (error) {
        console.error(error);
        callback.status(500).json({ error: error.message });
    }
}
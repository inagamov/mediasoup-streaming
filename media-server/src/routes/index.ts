import express from 'express';
const router = express.Router();

import {
    createStream,
    endStream,
    getStream,
    getStreams,
    getRtpCapabilities,
    storeWebRtcTransport,
    transportConnect,
    transportProduce,
    transportRecvConnect,
    consume,
    consumerResume,
} from '../controllers/streamsController';

router.post('/stream', createStream);
router.get('/streams', getStreams);
router.get('/stream/:id', getStream);
router.delete('/stream/:id', endStream);

router.get('/rtp-capabilities', getRtpCapabilities);
router.post('/web-rtc-transport', storeWebRtcTransport);
router.post('/transport-connect', transportConnect);
router.post('/transport-produce', transportProduce);
router.post('/transport-recv-connect', transportRecvConnect);
router.post('/consume', consume);
router.post('/consumer-resume', consumerResume);

export default router;

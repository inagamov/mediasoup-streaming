import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Worker } from "mediasoup/node/lib/Worker";
import { Router } from "mediasoup/node/lib/Router";

class Store {
    mediaServerRouter: any
    mediaServerWorker: any
    io: any;

    constructor() {
        this.mediaServerRouter = null;
        this.mediaServerWorker = null;

        this.io = null;
    }

    // media server router
    setMediaServerRouter(router: Router) {
        this.mediaServerRouter = router;
    }

    getMediaServerRouter() {
        return this.mediaServerRouter;
    }

    // media server worker
    setMediaServerWorker(worker: Worker) {
        this.mediaServerWorker = worker;
    }
    getMediaServerWorker() {
        return this.mediaServerWorker;
    }

    // web sockets
    setSocketIo(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        this.io = io;
    }
    getSocketIo() {
        return this.io;
    }
}

const store = new Store();

export default store;
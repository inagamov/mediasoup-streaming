import {User} from "./user";

export class Stream {
    id: string;
    title: string;
    viewersCount: number;
    host: User;
    messages: object;
    reactionsCount: number;
    isLive: boolean;
    isFinished: boolean;
    isMuted: boolean;
    producerTransport: object;
    consumerTransport: object;
    producer: object;
    consumer: object;

    constructor(id: string, title: string, host: User) {
        this.id = id;
        this.title = title;
        this.viewersCount = 0;
        this.host = host;
        this.messages = [];
        this.reactionsCount = 0;
        this.isLive = false;
        this.isFinished = false;
        this.isMuted = false;
        
        this.producerTransport = { video: null, audio: null };
        this.consumerTransport = { video: null, audio: null };
        this.producer = { video: null, audio: null };
        this.consumer = { video: null, audio: null };
    }
}


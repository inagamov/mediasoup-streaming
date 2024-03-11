import {User} from "./user";

export type StreamMessageType = "default" | "system";
export class StreamMessage {
    text: string;
    type: StreamMessageType;
    user?: User;
    createdAt: Date;

    constructor(text: string, user?: User, type: StreamMessageType = 'default') {
        this.text = text;
        this.type = type;
        this.user = user;
        this.createdAt = new Date();
    }
}
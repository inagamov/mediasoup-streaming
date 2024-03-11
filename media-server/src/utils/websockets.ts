import { Server } from "socket.io";
import { streams } from "../controllers/streamsController";
import store from "../stores";
import { WEBSOCKETS_EVENT_OPTIONS } from "../constants/websockets";
import { StreamMessage } from "../models/streamMessage";
import { User } from "../models/user";

export const initSocketIo = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN_URL,
            credentials: true,
        },
    });

    store.setSocketIo(io);
}

export const connectSocketIo = () => {
    store.getSocketIo().on("connection", (socket: any) => {
        /*
         * join stream
         */
        interface JoinStreamEvent {
            stream_id: string;
            user: User;
        }
        socket.on(WEBSOCKETS_EVENT_OPTIONS.JOIN_STREAM, ({stream_id, user}: JoinStreamEvent) => {
            const stream = streams.get(stream_id);
            if (stream) {
                socket.join(stream_id);

                if (stream.host.id !== user?.id) {
                    stream.viewersCount++;
                    emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, { viewersCount: stream.viewersCount });

                    const message = new StreamMessage(`${user.name} joined`, undefined, 'system')
                    stream.messages.push(message);
                    emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, message);
                }
            }
        });

        /*
         * leave stream
         */
        interface LeaveStreamEvent {
            stream_id: string;
            user: User;
        }
        socket.on(WEBSOCKETS_EVENT_OPTIONS.LEAVE_STREAM, ({stream_id, user}: LeaveStreamEvent) => {
            const stream = streams.get(stream_id);
            if (stream) {
                socket.leave(stream_id);

                if (stream.host.id !== user.id) {
                    stream.viewersCount--;
                    emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, {viewersCount: stream.viewersCount});

                    const message = new StreamMessage(`${user.name} left`, undefined, 'system');
                    stream.messages.push(message);
                    emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, message);
                } else {
                    stream.isLive = false;
                }
            }
        });

        /*
         * new reaction
         */
        interface StreamNewReactionEvent {
            stream_id: string;
        }
        socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_REACTION, ({stream_id}: StreamNewReactionEvent) => {
            const stream = streams.get(stream_id);
            if (stream) {
                stream.reactionsCount++;
                emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, {reactionsCount: stream.reactionsCount});
            }
        });

        /*
         * new message
         */
        interface StreamNewMessageEvent {
            stream_id: string;
            user: User;
            text: string;
        }
        socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, ({stream_id, user, text}: StreamNewMessageEvent) => {
            const stream = streams.get(stream_id);
            if (stream) {
                const message = new StreamMessage(text, user);
                stream.messages.push(message);
                emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_NEW_MESSAGE, message);
            }
        });

        /*
         * stream update
         */
        interface StreamUpdateEvent {
            stream_id: string;
            data: object;
        }
        socket.on(WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, ({stream_id, data}: StreamUpdateEvent) => {
            let stream = streams.get(stream_id);
            if (stream) {
                stream = {...stream, ...data}

                emitToChannel(stream.id, WEBSOCKETS_EVENT_OPTIONS.STREAM_UPDATE, data);
            }
        });
    });
}

export const emitToChannel = (stream_id: any, event: string, data: object) => {
    store.getSocketIo().to(stream_id).emit(event, data);
}
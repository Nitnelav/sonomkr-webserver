import { logger } from './logger';
import { Server, Socket } from "socket.io";
import { default as zmqService } from './zmq-service';
import { default as http } from 'http';


class SocketIoService {

    constructor(http: http.Server) {
        const stream = new Server(http, { 
            path: "/stream/",
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        ['leq_ch1','leq_ch2'].forEach(e => {
            zmqService.on(e, data => {
                stream.emit(e, data)
            })
        });
        ['audio_ch1','audio_ch2'].forEach(e => {
            zmqService.on(e, data => {
                stream.emit(e, data)
            })
        })
    }

}

export { SocketIoService }
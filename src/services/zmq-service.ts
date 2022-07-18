import { logger } from './logger';
import { Socket } from 'zeromq';
import { EventEmitter  } from 'events';

import dotenv from 'dotenv';
dotenv.config()

interface ZmqSocket {
    address: string,
    topic?: string,
    socket: Socket
}

let decoder = new TextDecoder("utf-8");

class ZmqService extends EventEmitter {
    
    audio: ZmqSocket = {
        address: process.env.ZMQ_AUDIO_ADDRESS || "tcp://192.168.0.15:6660",
        topic: process.env.ZMQ_AUDIO_TOPIC || "CH1",
        socket: new Socket("sub")
    };
    ch1: ZmqSocket = {
        address: process.env.ZMQ_CH1_ADDRESS || "tcp://192.168.0.15:6661",
        topic: process.env.ZMQ_CH1_TOPIC || "LEQ",
        socket: new Socket("sub")
    };
    ch2: ZmqSocket = {
        address: process.env.ZMQ_CH2_ADDRESS || "tcp://192.168.0.15:6662",
        topic: process.env.ZMQ_CH2_TOPIC || "LEQ",
        socket: new Socket("sub")
    };
    controller : ZmqSocket = {
        address: process.env.ZMQ_CONTROLLER_ADDRESS || "tcp://192.168.0.15:6666",
        socket: new Socket("req")
    }

    sum = 0

    constructor() {
        super()
        this.ch1.socket.on("message", (topic, msg) => {
            logger.debug(`zmq LEQ msg received on ch1 : ${msg}`);
            msg = decoder.decode(msg)
            this.emit('leq_ch1', msg)
        })
        this.ch2.socket.on("message", (topic, msg) => {
            logger.debug(`zmq LEQ msg received on ch2 : ${msg}`);
            msg = decoder.decode(msg)
            this.emit('leq_ch2', msg)
        })
        this.audio.socket.on("message", (topic, msg: Buffer) => {
            topic = decoder.decode(topic)
            logger.debug(`zmq AUDIO received for channel : ${topic} ; size : ${msg.length}`);
            let data = new Float32Array(msg.length / 4)
            for (let i = 0; i < msg.length; i += 4) {
                data[i / 4] = msg.readFloatLE(i);
            }
            this.emit('audio_' + topic.toLowerCase(), data)
        })
        this.ch1.socket.connect(this.ch1.address)
        this.ch1.socket.subscribe(this.ch1.topic || "LEQ")
        this.ch2.socket.connect(this.ch2.address)
        this.ch2.socket.subscribe(this.ch2.topic || "LEQ")
        this.audio.socket.connect(this.audio.address)
        this.audio.socket.subscribe(this.audio.topic || "CH1")

        this.controller.socket.connect(this.controller.address);
    }

    sendRequest(parts: string[], timeout?: number): Promise<any> {
        let timedOut = false;
        return new Promise((resolve, reject) => {
            this.controller.socket.send(parts);
            this.controller.socket.once("message", (...msg) => {
                msg = msg.map( (m: any) => decoder.decode(m) )
                if (!timedOut) {
                    resolve(msg);
                }
                console.log(msg);
            });
            if (timeout) {
                setInterval(() => {
                    timedOut = true;
                    reject("zmq request timed out with timeout : " + timeout + " ms")
                }, timeout)
            }
        })
    }
}

export default new ZmqService()
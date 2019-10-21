import { AudioContextAdapter } from "./AudioContexAdapter";

export class LiCAPStream {
    private ctx: AudioContext;
    private wsL: WebSocket;
    private wsR: WebSocket;
    private sampleRate: number;
    private startAt: number;


    constructor() {
        this.ctx = new AudioContextAdapter();
        this.sampleRate = 32000;
        this.startAt = 0;

        this.wsL = new WebSocket("ws://localhost:9002/LiCAP/L/subscribe");
        this.wsR = new WebSocket("ws://localhost:9002/LiCAP/R/subscribe");

        this.wsL.binaryType = "arraybuffer";
        this.wsR.binaryType = "arraybuffer";
    }

    play() {

        this.wsL.onmessage = (event) => {

            let floats = new Float32Array(event.data);
            let source = this.ctx.createBufferSource();
            
            let buffer = this.ctx.createBuffer(1, floats.length, this.sampleRate);
            buffer.getChannelData(0).set(floats);
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            this.startAt = Math.max(this.ctx.currentTime, this.startAt);
            source.start(this.startAt);
            this.startAt += buffer.duration;
        };
    }
}
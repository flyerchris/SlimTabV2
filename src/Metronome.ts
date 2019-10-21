import { AudioContextAdapter } from "./AudioContexAdapter"
type tickWeight = "normal" | "strong";
type mode = "click" | "schedule" | "";
export class Metronome {
    private audioContext: AudioContext;
    private nextTime: number;
    private gainNode: GainNode;
    private tickTimer: number;
    private bpm: number = 120;
    private timeOffset = 0.05;
    private sound: AudioBuffer;
    private sound2: AudioBuffer;
    private audioStartTime: number = -1; // start time in audioContext, unit in milli second
    private startTime: number = -1; // start time in performance.now(), unit in milli second
    private mode: mode = "";
    private scheduleOsc: AudioBufferSourceNode[] = [];
    private beatCount = 0;
    private startTimeOffset = 0.1;// unit in second
    constructor(bpm: number){
        this.audioContext = new AudioContextAdapter();
        if(bpm)this.bpm = bpm;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.5;
        this.gainNode.connect(this.audioContext.destination);
        this.base64toAudioBuffer(beep).then(decodeBuffer => this.sound = decodeBuffer);
        this.base64toAudioBuffer(beep2).then(decodeBuffer => this.sound2 = decodeBuffer);
    }
    startTick(){
        this.clearScheduleOsc();
        this.mode = "click";
        if(!this.tickTimer){
            let cycleTime = 60 / this.bpm;
            let at = this.audioContext.currentTime + this.startTimeOffset;
            this.nextTime = at + cycleTime;
            this.tickTimer = -1 * setTimeout(() => {
                this.tick();
                this.tickTimer = setInterval(() => this.tick(), cycleTime * 1000);
            }, cycleTime * 1000 - this.timeOffset*1000);
            this.makeSound(at);
            this.audioContext.resume();
        }
    }
    stopTick(){
        if(this.tickTimer < 0){
            clearTimeout(-1 * this.tickTimer);
        }else{
            clearInterval(this.tickTimer);
        }
        this.audioContext.suspend();
        this.clearScheduleOsc();
        this.tickTimer = null;
        this.startTime = -1;
        this.audioStartTime = -1;
        this.beatCount = 0;
    }
    setBpm(bpm: number){
        this.bpm = bpm;
    }
    scheduleTick(time: number, type: tickWeight = "normal"){ // time in milli second
        if(this.mode === "click"){
            this.stopTick();
            this.mode = "schedule";
        }
        if(this.startTime >= 0){
            console.warn("Cannot schedule tick before stop tick(call stopTick())");
            return;
        }
        let scheduleTime = this.audioContext.currentTime * 1000 + time;
        if(this.audioStartTime < 0)this.audioStartTime = scheduleTime;
        if(type === "normal"){
            this.makeSound(scheduleTime/1000);
        }else{
            this.makeSound(scheduleTime/1000, this.sound2);
        }
    }
    play(): number{
        if(this.startTime >= 0)return -1;
        if(this.scheduleOsc.length < 1){
            console.warn("no tick is scheduled");
            return -1;
        }
        this.startTime = this.audioStartTime - this.audioContext.currentTime*1000 + performance.now();
        this.audioContext.resume();
        return this.startTime;
    }

    getStartTime(): number{
        return this.startTime;
    }
    private base64toAudioBuffer(b64string: string): Promise<AudioBuffer>{
        return fetch(b64string)
        .then(res => res.arrayBuffer())
        .then((buffer) => {
            return new Promise<AudioBuffer>((resolve, reject)=>{
                this.audioContext.decodeAudioData(buffer, (value) =>{
                    resolve(value);
                }, () => {
                    reject();
                });// safari cannot recognize decodeAudioData as Promise = =
            });
        });
    }
    private clearScheduleOsc(){
        for(let i = 0; i < this.scheduleOsc.length; i++){
            this.scheduleOsc[i].disconnect();
        }
        this.scheduleOsc = [];
    }
    private tick(){
        let at = this.audioContext.currentTime;
        let cycleTime = 60 / this.bpm;
        if(at > this.nextTime){
            this.timeOffset += 0.05;
            this.makeSound(at + this.timeOffset);
            this.nextTime = at + this.timeOffset + cycleTime;
        }else{
            this.makeSound(this.nextTime);
            this.nextTime += cycleTime;
        }
        at = this.audioContext.currentTime;
        if(this.beatCount === 4){
            // there, this.nextTime is the time of 5th beat after above process
            this.startTime = performance.now() + (this.nextTime - at) * 1000;
        }
        if(this.scheduleOsc.length > 10)this.scheduleOsc.shift();
    }
    private makeSound( startTime: number, sound: AudioBuffer = this.sound): AudioBufferSourceNode{
        let osc = this.audioContext.createBufferSource();
        if(this.beatCount % 4 === 0 && this.mode === "click"){
            sound = this.sound2;
        }
        osc.buffer = sound;
        osc.connect(this.gainNode);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
        this.beatCount ++;
        this.scheduleOsc.push(osc);
        return osc;
    }
}

let beep = "data:audio/wav;base64,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";
let beep2= "data:audio/wav;base64,UklGRuYDAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0Yb4DAADw/wAAGAAgAOD+AP0I/Bj7OPr4+Uj5gPhw+BD4gPeQ96j5qPyo/vj9GPwo++j8wP9oAbAC6AOIBBADgADI/kj96PtI+9AB0AtgEYAZyCK4JlAimBkgBmjwAOUI3gDZKNco3LjlEO2o/CAQqBr4FqAM2ASw+njvCOpA+JAPOBzYDejzUOYw8PACmA1IEGAQkA8IC2AE8P44+rj2iPnQ7iDaQNOQ3QjscO6g57DjCOlA8qDzQPHY8QjzGPswBoANSBfAIGgooD52V+Ze1lDAOmgoFyAnHqYgpSCVG7YQ3wJp+br5vfEb4kHZ7tNr0JfP6sQWtxizELpLwR/KP9Wy4ZfwtfwLA+IPax58I1QaagxnA/AIoRXaFngM4wPRAc4EbwYrBQv4COl447jfxN604WfpJfRs+zD85Pzn/tcG/hXtILYm2S6MM8s0QStrH58fDiZgKXkm+R1yFEAPigbL/2H9Afvz9+D0mei/3XHX29cS3pfhzuYu7FbqU+i06cXshfNp+w8AcAl6E4oXdRIsDqEN7A09Do4OhAnmDh0ZnxqUFMgMWgNH8QjjNuBi5LbrH/G98bbxvfJ99pL+PgUqAtr5LPRF+0AJsxKtGnAd8hqTEtQKoAeXEoUcDh0TGsQTJg5OB+gBtADY/zEBQQPIAon88fU48rzsF+mJ6VbtH/Iy9fT5u/74AHcILBHCFJATnQ8IDKYVwiLxJ7keYBCoB/kCCQIqAzkD2ADm/Sr5CvUu9CjuuOeo4mLhsuQB7p/3T/x7/Qb+nP7wAysK2gxzDEgNLA4KEN4QQw9pCjECzvve+nz9zgCM/2n70/hn/SEFxAo3Cz8GyP/q/VUCeghMDbwPTw4wCjgF9gJNAwkH1wt4DWULBwhQBdkC5/3o+Rj5j/q//G/+H/kG8qPvHfKi9ur6LP45/37+6PnG9Zr1aPkF/rEABACJ/cT7QwDzBgQKyghbBfwATv7Q+277Mf2F//QAawEFA4YFugaiBaADmgKoAEP/Vf9B/j78xPrU+0/+UQBxAdsASP+j/g8ABQJhA10D8gHh//z+3P8OAd8BQAJjA0YEEgRDAzwBK/8n/S/8qvzI/eH+iv+D/3T+h/1P/g8ASQF0AJ/+a/0g/osApgJ3A/QCsgGRAC4A+f9UAN8AFwHNAGcAcwAjAKb/av/W/mL+SP57/g//tv/t/1j/of5q/k3+Tv6f/rb+mv6U/uf+ZP/I/xkASQBCAEgAYwB2AHgAZwBJADwAOwAzAAYA0v/B/83/3//w/wIADgAOAAcA";
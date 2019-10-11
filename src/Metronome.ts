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
    constructor(bpm: number){
        this.audioContext = new AudioContext();
        if(bpm)this.bpm = bpm;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.6;
        this.gainNode.connect(this.audioContext.destination);
        this.base64toAudioBuffer(beep).then(decodeBuffer => this.sound = decodeBuffer);
        this.base64toAudioBuffer(beep2).then(decodeBuffer => this.sound2 = decodeBuffer);
    }
    startTick(){
        this.clearScheduleOsc();
        this.mode = "click";
        if(!this.tickTimer){
            let cycleTime = 60 / this.bpm;
            this.audioContext.suspend();
            let at = this.audioContext.currentTime;
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
        let scheduleTime = this.audioContext.currentTime * 1000 + time;
        if(this.startTime < 0)this.audioStartTime = scheduleTime;
        if(type === "normal"){
            this.scheduleOsc.push(this.makeSound(scheduleTime/1000));
        }else{
            this.scheduleOsc.push(this.makeSound(scheduleTime/1000, this.sound2));
        }
    }
    play(): number{
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
        .then(buffer => this.audioContext.decodeAudioData(buffer))
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
    }
    private makeSound( startTime: number, sound: AudioBuffer = this.sound): AudioBufferSourceNode{
        let osc = this.audioContext.createBufferSource();
        osc.buffer = sound;
        osc.connect(this.gainNode);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
        this.beatCount ++;
        return osc;
    }
}

let beep = "data:audio/wav;base64,UklGRigHAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQQHAADw/wAAGAAgAOD+AP0I/Bj7OPr4+Uj5gPhw+BD4gPeQ96j5qPyo/vj9GPwo++j8wP9oAbAC6AOIBBADgADI/kj96PtI+9AB0AtgEYAZyCK4JlAimBkgBmjwAOUI3gDZKNco3LjlEO2o/CAQqBr4FqAM2ASw+njvCOpA+JAPOBzYDejzUOYw8PACmA1IEGAQkA8IC2AE8P44+rj2iPnQ7iDaQNOQ3QjscO6g57DjCOlA8qDzQPHY8QjzGPswBoANSBfAIGgooD51V+Ve1VDAOmgoGCAoHqggqCCYG7gQ4AJo+bj5uPEQ4jDZ2NNQ0HjPwMTbttOyy7kIweDJCNWI4YDwsPwQAwAQqB7II5AaiAxwAwgJ4BUgF6AM8APYAeAEiAZABej3oOjw4hjfGN4Q4ejo4PNQ+xj80Pzg/ggHoBboIegnWDBANZg2yCyQINAgiCcIKxAoQB9YFfAP2AbI/0D9wPqI90j0UOfQ2xjVeNUA3LDfMOXg6uDosOYg6GDrmPIQ+xAAMAoQFYAZCBRoD9gOMA+QD/APcApgEKgbYB3AFigOuAOg77jfgNwY4UDpSO/w7+DvAPE49WD++AV4Avj4cPKQ+qgKmBXgHigiWB+oFagM8AjYFZghUCLgHngX2BC4CEgC2ADQ/3AB8ANgA8j7uPMg71joyONA5ODowO6I8nD4aP44AbAKwBVgGvAY+BNwD+Ab6CzIM/gnYBUICugDsAIwBEgEIAEw/dD2OPEA8MDn4N7Q1+jVUNoQ51j02Pp4/Dj9CP6YBYAOaBLoETATkBRgF7AYcBZgD0ADwPlQ+Dj8OAFQ/wD5APUA/PAHwBCIEdAJqP+w/LgDmA1wFYAZUBewEJgI6ASABcgL8BPQFmgTwA0oCfAEWPxQ9dDzWPYw+jD9kPOQ5gjiaOag7oD2kPyI/iD9UPRA7MjrGPMY/GABCAAI+2j3iABQDsgUYBJICxgCYPz49hD22Pnw/iACMAPYBqAMgA8YDYAIKAaQATj+YP64+7D26PJ49bD70ADAA0ACGP5Y/CgAiAVYCWgJgAWo/xD9mP8gA5gF0AZgCkANyAxgCvgDSP2Y9jjzsPRg+Bj8YP5A/mD64Pao+TgA+ATIAYD6iPVI+EgCSAsIDwgNoAeYAtgA4P+YAVAEgAUgBCACaALAAAj+oPwg+Tj2WPVY9tj5EP6A/1j7+PUI9MjyYPKI9Oj0gPPQ8mj14Pmw/RABSAMYA5ADKAWIBggHcAbgBFAEmARYBIgAOPug+Bj54Pr4/IgAiAR4BmgGiAVgBKgDeAMQA0ACUAF4ADgBaAMABVgEIAIwALD/cABoAagBKAGAAOj+6Pwo/PD9+AAIA4gE8AVIBjgEgABo/Sj7aPkA+Wj5EPog+0D7APpA+XD6mPxI/jD/4P54/Uj86PsQ/Jj8IP14/cj9yP6IABgCQAS4BqgHGAcgBrgE+AHA/uD8CPyI++j7qP3Q/zgBKAE4AFj/sP5Y/mD+EABoAnADaAGI/dj6+PvI/8gCkATgBUgGsAXoBDAE4APQA3AD0AJoAjgCmAIQA/ACkAGw/4j+iP8QAvADGANoAHD+6P0Y/oj+wP6w/qj+QP9QADgBYAAo/oj86Pvg+1D70PpI+8j8wP5oAOD/KP2Q+jD5cPgQ+Pj36Pcw+OD4CPmA+Kj3MPeg9wD6gP3I/9gAwAEYAiACSAJQAqgCoAOoBDgG+AdQCQAKCAs4DIgM+AqgCCAHiAYwBgAGcAWIBOgD+AJoARAAQACoAdgCeALoAIj/YP1Y+jj4ePhg+mD8WP1Y/fj8yPyw/HD8cPtI+iD64Pqw+yj8kPwQ/bD9oP3I/MD76Ps4/eD+uABgAsgCCAIoAXgAMABoAOAAKAIQBGAFkAUQBQAEyAIYAtgBuAFwAVgBcAGAAZABqAFAATgAKAAYAbABCAG4/+D+2P5A/6j/CACAAPgAKAHYAGgAOABAAEAAGAD4/9j/sP9w/+D/+ADQARAC8AGYAWAAcP4A/eD8yP3Q/lD/UP8g/5D+mP3I/LD8MP3I/Vj+mP5o/vj9wP3o/fD9CP6A/lD/0P+w/yj/QP6I/cD8ePz4/PD9EP8IAGgA8ACwAQgCwAFAAagAoAAwAZABKAIYA7AD8AMIBKADkAJgAdgA4AAQASABAAEIAbAA+P9Y/4D/GAB4AAgASP84/xD/cP4A/iD+iP7A/rD+oP7Q/qD/gADAAOD/yP4w/lj+0P4g/0D/cP/Q//D/oP8o/0j/0P8gADgAYABQAFgAiACQABAAcP8w/5D/MACQACgAcP8Q/6j+KP7o/cj9yP0o/kD/aADwAHgBCAIwAtABQAGgAIgA4AD4AKAAWAB4AFAAsP8I/6D+wP5I/9j/EAB4/5D++P2o/Uj9OP04/sD/8ADIAUgCeAKQAg==";
let beep2= "data:audio/wav;base64,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";
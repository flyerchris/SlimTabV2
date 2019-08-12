export class Metronome {
    private audioContext: AudioContext;
    private nextTime: number;
    private gainNode: GainNode;
    private tickTimer: number;
    private bpm: number = 120;
    private timeOffset = 0.05;
    private sound: AudioBuffer;
    constructor(bpm: number){
        this.audioContext = new AudioContext();
        if(bpm)this.bpm = bpm;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.3;
        this.gainNode.connect(this.audioContext.destination);
        fetch(beep)
        .then(res => res.arrayBuffer())
        .then(buffer => this.audioContext.decodeAudioData(buffer))
        .then(decodeBuffer => this.sound = decodeBuffer);
    }
    startTick(){
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
        this.tickTimer = null;
    }
    setBpm(bpm: number){
        this.bpm = bpm;
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
    }
    private makeSound( startTime: number): AudioBufferSourceNode{
        let osc = this.audioContext.createBufferSource();
        osc.buffer = this.sound;
        osc.connect(this.gainNode);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
        return osc;
    }
}

let beep = "data:audio/wav;base64,UklGRigHAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQQHAADw/wAAGAAgAOD+AP0I/Bj7OPr4+Uj5gPhw+BD4gPeQ96j5qPyo/vj9GPwo++j8wP9oAbAC6AOIBBADgADI/kj96PtI+9AB0AtgEYAZyCK4JlAimBkgBmjwAOUI3gDZKNco3LjlEO2o/CAQqBr4FqAM2ASw+njvCOpA+JAPOBzYDejzUOYw8PACmA1IEGAQkA8IC2AE8P44+rj2iPnQ7iDaQNOQ3QjscO6g57DjCOlA8qDzQPHY8QjzGPswBoANSBfAIGgooD51V+Ve1VDAOmgoGCAoHqggqCCYG7gQ4AJo+bj5uPEQ4jDZ2NNQ0HjPwMTbttOyy7kIweDJCNWI4YDwsPwQAwAQqB7II5AaiAxwAwgJ4BUgF6AM8APYAeAEiAZABej3oOjw4hjfGN4Q4ejo4PNQ+xj80Pzg/ggHoBboIegnWDBANZg2yCyQINAgiCcIKxAoQB9YFfAP2AbI/0D9wPqI90j0UOfQ2xjVeNUA3LDfMOXg6uDosOYg6GDrmPIQ+xAAMAoQFYAZCBRoD9gOMA+QD/APcApgEKgbYB3AFigOuAOg77jfgNwY4UDpSO/w7+DvAPE49WD++AV4Avj4cPKQ+qgKmBXgHigiWB+oFagM8AjYFZghUCLgHngX2BC4CEgC2ADQ/3AB8ANgA8j7uPMg71joyONA5ODowO6I8nD4aP44AbAKwBVgGvAY+BNwD+Ab6CzIM/gnYBUICugDsAIwBEgEIAEw/dD2OPEA8MDn4N7Q1+jVUNoQ51j02Pp4/Dj9CP6YBYAOaBLoETATkBRgF7AYcBZgD0ADwPlQ+Dj8OAFQ/wD5APUA/PAHwBCIEdAJqP+w/LgDmA1wFYAZUBewEJgI6ASABcgL8BPQFmgTwA0oCfAEWPxQ9dDzWPYw+jD9kPOQ5gjiaOag7oD2kPyI/iD9UPRA7MjrGPMY/GABCAAI+2j3iABQDsgUYBJICxgCYPz49hD22Pnw/iACMAPYBqAMgA8YDYAIKAaQATj+YP64+7D26PJ49bD70ADAA0ACGP5Y/CgAiAVYCWgJgAWo/xD9mP8gA5gF0AZgCkANyAxgCvgDSP2Y9jjzsPRg+Bj8YP5A/mD64Pao+TgA+ATIAYD6iPVI+EgCSAsIDwgNoAeYAtgA4P+YAVAEgAUgBCACaALAAAj+oPwg+Tj2WPVY9tj5EP6A/1j7+PUI9MjyYPKI9Oj0gPPQ8mj14Pmw/RABSAMYA5ADKAWIBggHcAbgBFAEmARYBIgAOPug+Bj54Pr4/IgAiAR4BmgGiAVgBKgDeAMQA0ACUAF4ADgBaAMABVgEIAIwALD/cABoAagBKAGAAOj+6Pwo/PD9+AAIA4gE8AVIBjgEgABo/Sj7aPkA+Wj5EPog+0D7APpA+XD6mPxI/jD/4P54/Uj86PsQ/Jj8IP14/cj9yP6IABgCQAS4BqgHGAcgBrgE+AHA/uD8CPyI++j7qP3Q/zgBKAE4AFj/sP5Y/mD+EABoAnADaAGI/dj6+PvI/8gCkATgBUgGsAXoBDAE4APQA3AD0AJoAjgCmAIQA/ACkAGw/4j+iP8QAvADGANoAHD+6P0Y/oj+wP6w/qj+QP9QADgBYAAo/oj86Pvg+1D70PpI+8j8wP5oAOD/KP2Q+jD5cPgQ+Pj36Pcw+OD4CPmA+Kj3MPeg9wD6gP3I/9gAwAEYAiACSAJQAqgCoAOoBDgG+AdQCQAKCAs4DIgM+AqgCCAHiAYwBgAGcAWIBOgD+AJoARAAQACoAdgCeALoAIj/YP1Y+jj4ePhg+mD8WP1Y/fj8yPyw/HD8cPtI+iD64Pqw+yj8kPwQ/bD9oP3I/MD76Ps4/eD+uABgAsgCCAIoAXgAMABoAOAAKAIQBGAFkAUQBQAEyAIYAtgBuAFwAVgBcAGAAZABqAFAATgAKAAYAbABCAG4/+D+2P5A/6j/CACAAPgAKAHYAGgAOABAAEAAGAD4/9j/sP9w/+D/+ADQARAC8AGYAWAAcP4A/eD8yP3Q/lD/UP8g/5D+mP3I/LD8MP3I/Vj+mP5o/vj9wP3o/fD9CP6A/lD/0P+w/yj/QP6I/cD8ePz4/PD9EP8IAGgA8ACwAQgCwAFAAagAoAAwAZABKAIYA7AD8AMIBKADkAJgAdgA4AAQASABAAEIAbAA+P9Y/4D/GAB4AAgASP84/xD/cP4A/iD+iP7A/rD+oP7Q/qD/gADAAOD/yP4w/lj+0P4g/0D/cP/Q//D/oP8o/0j/0P8gADgAYABQAFgAiACQABAAcP8w/5D/MACQACgAcP8Q/6j+KP7o/cj9yP0o/kD/aADwAHgBCAIwAtABQAGgAIgA4AD4AKAAWAB4AFAAsP8I/6D+wP5I/9j/EAB4/5D++P2o/Uj9OP04/sD/8ADIAUgCeAKQAg==";
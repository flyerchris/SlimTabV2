
export class Metronome {
    private audioContext: AudioContext;
    private gainNode: GainNode;
    private oscillator: OscillatorNode;
    private tickTimer: number;
    private bpm: number = 120;
    constructor(bpm: number){
        this.audioContext = new AudioContext();
        if(bpm)this.bpm = bpm;
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.frequency.value = 800; // value in hertz
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0;
        this.gainNode.connect(this.audioContext.destination);
        this.oscillator.type = "square";
        this.oscillator.start();
        this.oscillator.connect(this.gainNode);
    }
    startTick(){
        let cycleTime = 60 * 1000 / this.bpm;
        if(!this.tickTimer){
            this.tickTimer = setInterval(() => this.tick(), cycleTime);
        }
        this.tick();
    }

    stopTick(){
        clearInterval(this.tickTimer);
        this.tickTimer = null;
    }
    setBpm(bpm: number){
        this.bpm = bpm;
        if(this.tickTimer){
            this.stopTick();
            this.startTick();
        }
    }
    private tick(){
        this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0);
        this.gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.01);
        this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.02);
    }
}
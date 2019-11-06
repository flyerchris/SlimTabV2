import { MidiData } from "./SlimTabV2Interface"
export class MidiTimeCorrection{
    startTimeOffset: number = 0;
    timeOffset: number = 0;
    private bpm: number = 120;
    private isWorking = false;
    
    constructor(bpm?: number){
        if(bpm){
            this.bpm = bpm;
        }
    }
    correct(time: number){
        let rbc = this.timeToBeatCount(time + this.startTimeOffset);
        return rbc;
    }
    get milliSecondPerBeat(){
        return 60 *1000 / this.bpm;
    }
    setBpm(val: number){
        this.bpm = val;
    }
    activate(){
        this.isWorking = true;
    }
    deactivate(){
        this.isWorking = false;
    }

    private timeToBeatCount(time: number){
        let ratio = [3, 1];
        let unit = this.milliSecondPerBeat/(2*(ratio[0] + ratio[1]));
        let range = [unit * ratio[0]/2];
        for(let i = 0; i < 3; i++)range.push(range[i] + ratio[(i+1)%2]*unit);

        let beat = time / this.milliSecondPerBeat;
        let bd = Math.floor(beat);
        let bcs = (beat - bd) * this.milliSecondPerBeat;
        let bc = 4;
        for(let i = 0; i < 4; i++){
            if(bcs < range[i]){
                bc = i;
                break;
            }
        }
        return bd + bc * 0.25;
    }
}
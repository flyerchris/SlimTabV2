import { KeyBoardAdapter } from "./KeyBoardAdapter"
import { Midi2Tab } from "./Midi2Tab"
export class MidiCorrection{
    startTimeOffset: number = 0;
    timeOffset: number = 0;
    private bpm: number = 120;
    private isWorking = false;
    private mid2tab: Midi2Tab;
    
    constructor(bpm?: number){
        if(bpm){
            this.bpm = bpm;
        }
    }
    correct(time: number, signal: boolean, channel: number, key: number, vel: number){
        let rbc = this.timeToBeatCount(time + this.startTimeOffset);
        if(this.mid2tab){
            this.mid2tab.push(rbc, signal, {channel: KeyBoardAdapter.noteKeyToStringData(key)[0], key: key, velocity: vel, signal: signal});
        }
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
    use(m2t: Midi2Tab){
        this.mid2tab = m2t;
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
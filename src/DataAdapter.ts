import { Callbacks } from "./utils"
import { Note } from "./SlimTabV2Types"
export class DataAdapter{
    startTimeOffset: number = 0;
    timeOffset: number = 0;
    private bpm: number = 120;
    private rawData: [number, number, number][] = [];
    private preTime: number;
    private noteRawData: Note;
    private receiveInterval:number;
    private lengthPerBeat: number = 4;
    private callbacks: Callbacks;
    private chordInterval: number = -0.2 * this.bpm + 84;//120=>60, 420=>0
    private beatInnerCount = [0, 0];
    private isWorking = false;
    
    constructor(bpm?: number){
        if(bpm){
            this.bpm = bpm;
        }
        this.callbacks = new Callbacks(["packNote", "data"]);
    }
    receiveData(stringIndex: number, note: number, amp: number, time: number){
        if(!this.isWorking)return;
        this.rawData.push([stringIndex, note, time + 40 + this.timeOffset]);
        if(!this.receiveInterval){
            this.receiveInterval = setTimeout(this.packNote.bind(this), this.chordInterval);
        }
        this.callbacks["data"].callAll(stringIndex, note, time);
    }
    addPackListener(cb: (data: Note) => any){
        this.callbacks["packNote"].push(cb);
    }
    addDataListener(cb: (string: number, note: number, time: number) => any){
        this.callbacks["data"].push(cb);
    }
    getTime(): number{
        return performance.now();
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
        this.init();
        this.isWorking = false;
    }
    private init(){
        this.rawData = [];
        this.beatInnerCount = [0, 0];
        this.noteRawData = null;
    }
    private packNote(){
        let notes = [-1, -1, -1, -1, -1, -1];
        for(let i = 0; i < this.rawData.length; i++){
            notes[this.rawData[i][0]] = this.rawData[i][1];
        }
        let rbc = this.timeToBeatCount(this.rawData[0][2] + this.startTimeOffset);
        if(this.beatInnerCount[0] != Math.floor(rbc / 0.5) * 0.5){
            this.beatInnerCount[0] = Math.floor(rbc / 0.5) * 0.5;
            if(rbc !== Math.floor(rbc / 0.5) * 0.5){
                this.beatInnerCount[1] = 1;
            }else{
                this.beatInnerCount[1] = 0;
            }
        }
        this.beatInnerCount[1]++;
        if(this.beatInnerCount[1] > 2){
            this.preTime = (this.beatInnerCount[0] + 0.25) * this.milliSecondPerBeat - this.startTimeOffset;
            this.receiveInterval = null;
            this.rawData = [];
            return;
        }
        if(this.noteRawData){
            let bc = rbc - this.timeToBeatCount(this.preTime + this.startTimeOffset);
            let nv;
            if(bc <= 0){
                nv = 16;
                this.preTime = (this.timeToBeatCount(this.rawData[0][2] + this.startTimeOffset) + 0.25) * this.milliSecondPerBeat - this.startTimeOffset;
            }else{
                nv = this.lengthPerBeat / bc;
                this.preTime = this.rawData[0][2];
            }
            this.noteRawData.noteValue = nv;
            this.noteRawData.userData = null;
            this.callbacks["packNote"].callAll(this.noteRawData);
        }else{
            if(rbc !== 0){
                let bc = rbc;
                let nv = this.lengthPerBeat / bc;
                this.noteRawData = new Note({noteValue: nv, stringContent: [-1, -1, -1, -1, -1, -1]});
                this.callbacks["packNote"].callAll(this.noteRawData);
            }
            this.preTime = this.rawData[0][2];
        }
        this.noteRawData = new Note({noteValue: 4, stringContent: notes, userData: "undefined-value"});
        this.rawData = [];
        this.receiveInterval = null;
        this.callbacks["packNote"].callAll(this.noteRawData);
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
import { Callbacks } from "./utils"
import { Note } from "./SlimTabV2Types"
export class DataAdapter{
    timeOffset: number = 0;
    private rawData: [number, number, number][] = [];
    private preTime: number;
    private noteRawData: Note;
    private receiveInterval:number;
    private milliSecondPerBeat: number = 60 * 1000 / 120; // second per beat, defalut value corresponds to 120 bpm
    private lengthPerBeat: number = 4;
    private callbacks: Callbacks;
    private chordInterval: number = 60;
    
    constructor(bpm?: number){
        if(bpm){
            this.milliSecondPerBeat = 60 *1000 / bpm;
        }
        this.callbacks = new Callbacks(["packNote", "data"]);
    }
    receiveData(stringIndex: number, note: number, amp: number, time: number){
        this.rawData.push([stringIndex, note, time]);
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

    private packNote(){
        let notes = [-1, -1, -1, -1, -1, -1];
        for(let i = 0; i < this.rawData.length; i++){
            notes[this.rawData[i][0]] = this.rawData[i][1];
        }
        if(this.noteRawData){
            let nv = this.lengthPerBeat / (this.timeToBeatCount(this.rawData[0][2] + this.timeOffset) - this.timeToBeatCount(this.preTime + this.timeOffset));
            this.noteRawData.noteValue = nv;
            this.noteRawData.userData = null;
            this.callbacks["packNote"].callAll(this.noteRawData);
        }
        this.preTime = this.rawData[0][2];
        this.noteRawData = new Note({noteValue: 8, stringContent: notes, userData: "undefined-value"});
        this.rawData = [];
        this.receiveInterval = null;
        this.callbacks["packNote"].callAll(this.noteRawData);
    }

    private timeToBeatCount(time: number){
        let beat = time / this.milliSecondPerBeat;
        let bd = Math.floor(beat);
        let bc = beat - bd;
        bc = Math.floor(bc * 4 + 0.5) / 4;
        return bd + bc;
    }
}
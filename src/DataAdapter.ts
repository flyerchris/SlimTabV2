import { Callbacks } from "./utils"
import { Note } from "./SlimTabV2Types"
import { Timeline } from "./Timeline"
export class DataAdapter{
    private rawData: [number, number, number][] = [];
    private preTime: number;
    private noteRawData: Note;
    private receiveInterval:number;
    private bpm = 120;
    private lengthPerBeat: number = 4;
    private callbacks: Callbacks;
    private timeline: Timeline;
    private chordInterval: number = 150;

    constructor(tl: Timeline, bpm?: number){
        if(bpm){
            this.bpm = bpm;
        }
        this.timeline = tl;
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
    get spb(): number{
        return 60 * 1000 / this.bpm;
    }
    private packNote(){
        let notes = [-1, -1, -1, -1, -1, -1];
        for(let i = 0; i < this.rawData.length; i++){
            notes[this.rawData[i][0]] = this.rawData[i][1];
        }
        if(this.noteRawData){
            let duration = this.timeline.getElapseTime() - this.preTime;
            if(duration > this.spb * this.lengthPerBeat){
                this.noteRawData[0] = 1;
            }else{
                let l2 = Math.log(this.spb / duration) / Math.log(2);
                let l3 = Math.log(this.spb / (3 * duration)) / Math.log(2) + 1;
                let bl = Math.pow(2, Math.ceil(l2 - 0.5));
                this.noteRawData[0] = Math.min(this.lengthPerBeat * bl, 32);
            }
            this.noteRawData.userData = null;
            this.callbacks["packNote"].callAll(this.noteRawData);
        }
        this.preTime = this.rawData[0][2];
        this.noteRawData = new Note({noteValue: 8, stringContent: notes, userData: "undefined-value"});
        this.rawData = [];
        this.receiveInterval = null;
        this.callbacks["packNote"].callAll(this.noteRawData);
    }
}
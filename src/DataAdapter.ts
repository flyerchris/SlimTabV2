import { Callbacks } from "./utils"
import { note } from "./SlimTabV2Types"
export class DataAdapter{
    private rawData: [number, number, number][] = [];
    private preTime: number;
    private noteRawData: note;
    private receiveInterval:number;
    private spb: number = 60 * 1000 / 120; // second per beat, defalut value corresponds to 120 bpm
    private lengthPerBeat: number = 4;
    private callbacks: Callbacks;
    
    constructor(bpm?: number){
        if(bpm){
            this.spb = 60 *1000 / bpm;
        }
        this.callbacks = new Callbacks(["data"]);
    }
    receiveData(stringIndex: number, note: number, amp: number, time: number){
        this.rawData.push([stringIndex, note, time]);
        if(!this.receiveInterval){
            this.receiveInterval = setTimeout(this.packNote.bind(this),10);
        }
    }
    addDataListener(cb: (data: note) => any){
        this.callbacks["data"].push(cb);
    }
    private packNote(){
        let notes = [-1, -1, -1, -1, -1, -1];
        for(let i = 0; i < this.rawData.length; i++){
            notes[this.rawData[i][0]] = 3;
        }
        if(this.noteRawData){
            let duration = this.rawData[0][2] - this.preTime;
            if(duration > this.spb * this.lengthPerBeat){
                this.noteRawData[0] = 1;
            }else{
                let l2 = Math.log(this.spb / duration) / Math.log(2);
                let l3 = Math.log(this.spb / (3 * duration)) / Math.log(2) + 1;
                let bl = Math.pow(2, Math.ceil(l2 - 0.5));
                this.noteRawData[0] = this.lengthPerBeat * bl;
            }
            this.callbacks["data"].callAll(this.noteRawData);
        }
        this.preTime = this.rawData[0][2];
        this.noteRawData = [8, notes, null];
        this.rawData = [];
        this.receiveInterval = null;
    }
}
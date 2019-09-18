export class DataAdapter{
    private rawData: [number, number, number][] = [];
    private preTime: number;
    private noteRawData: [number, number[], any];
    private receiveInterval:number;
    private spb: number = 60 * 1000 / 120; // second per beat, defalut value corresponds to 120 bpm
    private lengthPerBeat: number = 4;
    private sendData: Function;
    
    constructor(bpm?: number){
        if(bpm){
            this.spb = 60 *1000 / bpm;
        }
    }
    receiveData(stringIndex: number, note: number, amp: number, time: number){
        this.rawData.push([stringIndex, note, time]);
        if(!this.receiveInterval){
            this.receiveInterval = setTimeout(this.packNote.bind(this),10);
        }
    }
    setSendDataCallBack(cb: Function){
        this.sendData = cb;
    }
    private packNote(){
        let notes = [-1, -1, -1, -1, -1, -1];
        for(let i = 0; i < this.rawData.length; i++){
            notes[this.rawData[i][0]] = this.rawData[i][1];
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
            console.log(this.noteRawData);
            this.sendData(this.noteRawData);
        }
        this.preTime = this.rawData[0][2];
        this.noteRawData = [8, notes, null];
        this.rawData = [];
        this.receiveInterval = null;
    }
}
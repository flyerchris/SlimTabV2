export class Timeline{
    private startTime: number;
    private bpm: number = 120;
    private offset: number = 0;

    constructor(bpm?: number){
        this.startTime = this.ajustedTime();
        if(bpm) this.bpm = bpm;
    }

    reset(){
        this.offset = 0;
        this.startTime = this.ajustedTime();
    }

    getElapseTime(): number{
        return this.ajustedTime() - this.startTime;
    }

    getBeatCount(): number{
        let beat = this.getElapseTime() / this.secondPerBeat;
        let bd = Math.floor(beat);
        let bc = beat - bd;
        bc = Math.floor(bc*32 + 0.5) / 32;
        return bd + bc;
    }

    get secondPerBeat(): number{
        return 60 * 1000 / this.bpm;
    }
    
    setOffset(val: number){
        this.offset = val;
    }

    private ajustedTime(): number{
        return performance.now() + this.offset;
    }
}
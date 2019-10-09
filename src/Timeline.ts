export class Timeline{
    private startTime: number;
    private offset: number = 0;
    private _resetCount: number = 0;

    constructor(){
        this.startTime = performance.now();
    }

    reset(offset: number = 0){
        this.offset = offset;
        this.startTime = performance.now();
        this._resetCount++;
    }

    getElapseTime(): number{
        return this.ajustedTime() - this.startTime;
    }

    get resetCount(): number{
        return this._resetCount;
    }

    private ajustedTime(): number{
        return performance.now() + this.offset;
    }
}
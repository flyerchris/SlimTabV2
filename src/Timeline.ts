export class Timeline{
    private _startTime: number;
    offset: number = 0;

    constructor(){
        this._startTime = performance.now();
    }

    reset(offset: number = 0){
        this.offset = offset;
        this._startTime = performance.now();
    }

    getElapseTime(): number{
        return this.ajustedTime() - this.startTime;
    }

    get startTime(): number{
        return this._startTime;
    }

    private ajustedTime(): number{
        return performance.now() + this.offset;
    }
}
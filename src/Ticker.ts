

export class Ticker{
    static _ticker: Ticker = new Ticker();

    _running: boolean = false;
    _systemTime: number = 0;
    _lastTime: number = 0;
    _delay: number = 33;
    _funcs: Array<Function> = [];
    _timerId: number = null;
    _executeFuncs: Array<ExecuteValue> = [];

    constructor(){}

    _searchIndex(time: number){
        let funcs: Array<ExecuteValue> = this._executeFuncs;
        let low: number = 0;
        let high: number = funcs.length;
        let mid: number = 0;
        while (low < high){
            mid = Math.floor(low + (high - low)/2);
            if(time >= funcs[mid].time){
                low = mid +1;
            }
            else{
                high = mid -1;
            }

        }
        return low;
    }

    _register(func: Function){
        if (this._funcs.indexOf(func)){
            return;
        }
        this._funcs.push(func);
    }

    _registerDelay(func: Function, delay: number, time: number, loop: number){
        let index: number = this._searchIndex(time);
        let value: ExecuteValue = {func: func, delay: delay, time: time, loop: loop};
        this._executeFuncs.splice(index, 0, value);
    }
    _unregister (func: Function) {
        this._funcs.map((value: Function, index: number) => {
            if (func === value) {
                this._funcs.splice(index, 1);
            }
        });
    }

    _start(systemTime: number = 0){
        if(this._running){
            return;
        }
        this._running = true;
        this._systemTime = systemTime;
        this._lastTime = new Date().getTime();
        this._update();
    }

    _stop(){
        if(this._timerId){
            clearTimeout(this._timerId);
            this._timerId = null;
        }
        this._running = false;
    }

    _update(){
        let currentTime: number = new Date().getTime();
        let delay: number = currentTime - this._lastTime;
        this._systemTime += delay;
        this._funcs.forEach((value: Function) =>{
            value(delay);
        });
        this._executeFunc();
        this._lastTime =currentTime;
        this._timerId = setTimeout(this._update.bind(this), this._delay);
    }

    _executeFunc(){
        if(this._executeFuncs[0] && this._executeFuncs[0].time < this._systemTime){
            let value: ExecuteValue = this._executeFuncs.shift();
            value.func();

            this._executeFunc();

            // loop <= 0 will be infinite loop
            if (value.loop > 0 && --value.loop ===0){
                return;
            }
            let nextTime: number = value.time + value.delay;
            this._registerDelay(value.func, value.delay, nextTime, value.loop)
        }
    }
    _clearFuncs(){
        this._funcs= [];
    }
    _clearExecuteFuncs(){
        this._executeFuncs = [];
    }

    static register(func: Function){
        this._ticker._register(func);
    }

    static unregister(func: Function){
        this._ticker._unregister(func);
    }

    static registerDelay(func: Function, delay:number, loop: number = 1){
        let time: number = this._ticker._systemTime + delay;
        this._ticker._registerDelay(func, delay, time, loop);
    }

    static start(systemTime: number = 0){
        this._ticker._start(systemTime);
    }

    static stop(){
        this._ticker._stop();
    }

    static clearFuncs(){
        this._ticker._clearFuncs();
    }

    static clearDelayFuncs(){
        this._ticker._clearExecuteFuncs();
    }

    static get systemTime():number {
        return this._ticker._systemTime;
    }

    static get running(): boolean{
        return this._ticker._running;
    }

}

interface ExecuteValue {
    func: Function;
    time: number;
    delay: number;
    loop: number;
}
export class Timer{
    _running: boolean = false;
    _systemTime: number = 0;
    lastTime: number = 0;
    delay: number = 33;
    funcs: Array<Function> = [];
    timerId: number = null;
    executeFuncs: Array<ExecuteValue> = [];

    constructor(){}

    searchIndex(time: number){
        let funcs: Array<ExecuteValue> = this.executeFuncs;
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

    register(func: Function){
        if (this.funcs.indexOf(func)){
            return;
        }
        this.funcs.push(func);
    }

    registerDelay(func: Function, delay:number, loop: number = 1){
        let time: number = this._systemTime + delay;
        this.registerDelayP(func, delay, time, loop);
    }
    
    unregister (func: Function) {
        this.funcs.map((value: Function, index: number) => {
            if (func === value) {
                this.funcs.splice(index, 1);
            }
        });
    }

    start(systemTime: number = 0){
        if(this._running){
            return;
        }
        this._running = true;
        this._systemTime = systemTime;
        this.lastTime = new Date().getTime();
        this.update();
    }

    stop(){
        if(this.timerId){
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this._running = false;
        this._systemTime = 0;
        this.lastTime = 0;
        this.clearFuncs();
        this.clearDelayFuncs();
    }

    update(){
        let currentTime: number = new Date().getTime();
        let delay: number = currentTime - this.lastTime;
        this._systemTime += delay;
        this.funcs.forEach((value: Function) =>{
            value(delay);
        });
        this.executeFunc();
        this.lastTime =currentTime;
        this.timerId = setTimeout(this.update.bind(this), this.delay);
    }

    executeFunc(){
        if(this.executeFuncs[0] && this.executeFuncs[0].time < this._systemTime){
            let value: ExecuteValue = this.executeFuncs.shift();
            value.func();

            this.executeFunc();

            // loop <= 0 will be infinite loop
            if (value.loop > 0 && --value.loop ===0){
                return;
            }
            let nextTime: number = value.time + value.delay;
            this.registerDelayP(value.func, value.delay, nextTime, value.loop)
        }
    }
    clearFuncs(){
        this.funcs= [];
    }
    clearDelayFuncs(){
        this.executeFuncs = [];
    }

    private registerDelayP(func: Function, delay: number, time: number, loop: number){
        let index: number = this.searchIndex(time);
        let value: ExecuteValue = {func: func, delay: delay, time: time, loop: loop};
        this.executeFuncs.splice(index, 0, value);
    }
}

interface ExecuteValue {
    func: Function;
    time: number;
    delay: number;
    loop: number;
}
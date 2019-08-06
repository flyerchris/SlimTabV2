let utils = {
    setAttributes: function(el:Element, attr:{[key: string]: string}){
        for(let k in attr){
            el.setAttribute(k, attr[k]);
        }
    },
    setStyle: function(el:HTMLElement, style:{[key: string]: string}){
        for(let k in style){
            el.style.setProperty(k, style[k]);
        }
    }
}

class ArrayFunction {
    private funcs: Array<Function> = [];
    call(...args: any[]) {
        this.funcs.forEach((func) => {
            func(...args);
        })
    }

    push(cbk: (...args: any[]) => void): void {
        this.funcs.push(cbk);
    }
};

export class Callbacks {
    [key: string]: ArrayFunction;
    constructor(eventType: Array<string>) {
        eventType.forEach(element => {
            this[element] = new ArrayFunction();
        });
    }
}

export {utils};
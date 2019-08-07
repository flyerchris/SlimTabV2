export namespace utils {
    export function setAttributes(el: Element, attr:{[key: string]: string}){
        for(let k in attr){
            el.setAttribute(k, attr[k]);
        }
    }
    export function setStyle(el: HTMLElement, style:{[key: string]: string}){
        for(let k in style){
            el.style.setProperty(k, style[k]);
        }
    }

    const noteNumber = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11};
    const regex = /^([CDEFGAB]#?)([0-9])$/;
    export function noteToDecimal(note: string) {
        let groups = regex.exec(note);
        if(groups.length != 3)
            return -1;
        return noteNumber[groups[1] as keyof typeof noteNumber]+(Number(groups[2])+1)*12;
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

//export type note = [number, number[], any];// [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
export type section = Note[];
export class Note {
    0: number;
    1: number[];
    2: any;
    constructor(data: {noteValue?: number, stringContent?: number[], userData?: any, 0?: number, 1?: number[], 2?: any} = {}){
        if(data[0]){
            this[0] = data[0];
            this[1] = data[1] || [-1, -1, -1, -1, -1, -1];
            this[2] = data[2] || null;
            return;
        }
        this[0] = data.noteValue || 4;
        this[1] = data.stringContent || [-1, -1, -1, -1, -1, -1];
        this[2] = data.userData || null;
    }
    get noteValue(): number{
        return this[0];
    }
    set noteValue(l: number){
        this[0] = l;
    }
    get stringContent(){
        return this[1];
    }
    set stringContent(v: number[]){
        this[1] = v;
    }
    get userData(){
        return this[2];
    }
    set userData(v: any){
        this[2] = v;
    }
}
import { Note } from "./SlimTabV2Types"
import { MidiData } from "./SlimTabV2Interface"
import { Callbacks } from "./utils"
export class Midi2Tab {
    private bpm: number = 120;
    private inputData :{
        beatNumber: number;
        noteOnData: MidiData[];
        noteOffData: MidiData[];
    }[] = [];
    private timeUnit: number = 60000 / this.bpm / 4;
    private beatInnerCount = [0, 0];
    private chordHandlerId = -1;
    private callBack: Callbacks;

    constructor(){
        this.callBack = new Callbacks(["pack"]);
    }

    addPackListener(cb: (note: Note) => any){
        this.callBack["pack"].push(cb);
    }

    push(beatNumber: number, signal: boolean, data: MidiData){
        let li = this.inputData.length - 1;
        if(li > -1){
            if(this.inputData[li].beatNumber > beatNumber){
                console.error("beat number less than previous data");
                return;
            }
            if(this.inputData[li].beatNumber == beatNumber){
                if(signal){
                    this.inputData[li].noteOnData[data.channel] = data;
                    this.inputData[li].beatNumber = beatNumber;
                }else{
                    if(li < 1){
                        console.error("should not start inputing with note off");
                        return;
                    }
                    this.inputData[li].noteOffData[data.channel] = data;
                    this.inputData[li].beatNumber = beatNumber;
                }
            }else{
                if(this.chordHandlerId != -1){
                    clearTimeout(this.chordHandlerId);
                    this.packNote();
                    this.push(beatNumber, signal, data);
                    return;
                }
                this.pushEmptyData();
                li = this.inputData.length - 1;
                if(signal){
                    this.inputData[li].noteOnData[data.channel] = data;
                    this.inputData[li].beatNumber = beatNumber;
                }else{
                    this.inputData[li].noteOffData[data.channel] = data;
                    this.inputData[li].beatNumber = beatNumber;
                }
                this.chordHandlerId = setTimeout(() => this.packNote(), this.timeUnit);
            }
        }else{
            if(!signal){
                console.error("should not start inputing with note off");
                return;
            }
            this.pushEmptyData();
            this.inputData[0].noteOnData[data.channel] = data;
            this.inputData[0].beatNumber = beatNumber;
        }
    }

    private packNote(){
        //TODO: link note
        let li = this.inputData.length - 1;
        let rn = new Note({noteValue: this.inputData[li].beatNumber - this.inputData[li-1].beatNumber});
        let string_base_id = [40, 45, 50, 55, 59, 64].reverse();
        this.inputData[li-1].noteOnData.forEach((data, i) => {
            let block = data.key - string_base_id[i];
            rn.stringContent[i] = block;
            if(!this.inputData[li].noteOffData[i]){
                this.inputData[li].noteOnData[i] = data;
            }
        });
        this.inputData.shift();
        if(this.inputData[0].noteOnData.length == 0)this.inputData.shift();
        this.callBack["pack"].callAll(rn);
        this.chordHandlerId = -1;
    }



    private pushEmptyData(){
        this.inputData.push({beatNumber: 99999999, noteOnData: [], noteOffData: []});
    }
}
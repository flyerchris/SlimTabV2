import {Callbacks} from './utils';

export interface LiCAPDevice {
    /**
     * on
     * Event registeration(support multiple event registeration)
     * @param ename name of the event
     * @param cbk callback
     */
    on(ename: string, cbk: (...args: any[]) => void): void;
    resetTimer(): void;
}

export class LiCAP implements LiCAPDevice {
    private device: WebMidi.MIDIInput;
    private callbacks: Callbacks;
    private startTime: number;

    /**
     * ctor
     * @param device valid MIDIInput
     */
    private constructor(device: WebMidi.MIDIInput) {
        this.device = device;
        this.callbacks = new Callbacks(["pick"]);
        this.startTime = performance.now();
        
        this.device.onmidimessage = this.onMessage.bind(this);
    }

    on(ename: string, cbk: (...args: any[]) => void): void {
        if(ename in this.callbacks) {
            this.callbacks[ename].push(cbk);
        }
    }

    resetTimer(){
        this.startTime = performance.now();
    }
    /**
     * isSupported
     * Check if LiCAP is supported by computer or not
     */
    static isSupported(): boolean | string {
        return (navigator as any).requestMIDIAccess as boolean;
    }

    /**
     * enumerate
     * Enumerate available LiCAP devices
     */
    static async enumerate(): Promise<Array<LiCAPDevice>> {
        let ret: Array<LiCAPDevice> = [];

        if(LiCAP.isSupported()) {
            let access = await navigator.requestMIDIAccess();
        
            for(let input of access.inputs.values()) {
                console.log(input.name);
                if(input.name.match(/LiCAP MIDI Device/)) {
                    ret.push(new LiCAP(input));
                    console.log(`use ${input.name}`);
                    break;
                }
            }
        }
        return ret;
    }

    private onMessage(e: WebMidi.MIDIMessageEvent): void {
        // Simply parse the data
        let stringIdx = e.data[0] & 0xF;
        // TODO: 
        let string_base_id = [40, 45, 50, 55, 59, 64].reverse();
        //console.log(e.data);
        switch((e.data[0]>>4) & 0xF) {
            case 8:
                // note off
                break;
            case 9:
                // note on
                this.callbacks["pick"].callAll(stringIdx, e.data[1]-string_base_id[stringIdx], e.data[2] / 255, e.timeStamp);// string idex, note, amp, time stamp
                break;
        }
        
    }
}
/*

 if(LiCAP.isSupported()) {
     console.log("Your browser supports LiCAP");

     LiCAP.enumerate().then((devs) => {
         if(devs.length > 0) {
            
             devs[0].on("pick", 
                 (stringIdx, note, amp, time) => {
                     console.log(stringIdx, note, time);
             });
         }
     })
 } else {
     console.log("Your browser does not support LiCAP");
}
*/
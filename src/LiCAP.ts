

import {Callbacks, utils} from './utils';

export interface LiCAP {
    /**
     * on
     * Event registeration(support multiple event registeration)
     * @param ename name of the event
     * @param cbk callback
     */
    on(ename: string, cbk: (...args: any[]) => void): void;
}



class LiCAPDevice implements LiCAP {
    private device: WebMidi.MIDIInput;
    private callbacks: Callbacks;

    /**
     * ctor
     * @param device valid MIDIInput
     */
    private constructor(device: WebMidi.MIDIInput) {
        this.device = device;
        this.callbacks = new Callbacks(["pick"]);
        
        this.device.onmidimessage = this.onMessage.bind(this);
    }

    on(ename: string, cbk: (...args: any[]) => void): void {
        if(ename in this.callbacks) {
            this.callbacks[ename].push(cbk);
        }
    }

    /**
     * isSupported
     * Check if LiCAP is supported by computer or not
     */
    static isSupported(): boolean {
        return (navigator as any).requestMIDIAccess as boolean;
    }

    /**
     * enumerate
     * Enumerate available LiCAP devices
     */
    static async enumerate(): Promise<Array<LiCAP>> {
        let ret: Array<LiCAP> = [];

        if(LiCAPDevice.isSupported()) {
            let access = await navigator.requestMIDIAccess();
        
            for(let input of access.inputs.values()) {
                console.log(input.name);
                if(input.name.match(/LoopBe Internal MIDI/)) {
                    ret.push(new LiCAPDevice(input));
                }
            }
        }
        return ret;
    }

    private onMessage(e: WebMidi.MIDIMessageEvent): void {
        // Simply parse the data
        let stringIdx = e.data[0] & 0xF;
        switch((e.data[0]>>4) & 0xF) {
            case 8:
                // note off
                break;
            case 9:
                // note on
                this.callbacks["pick"].call(stringIdx, e.data[1], e.data[2] / 255);
                break;
        }
        
    }
}


if(LiCAPDevice.isSupported()) {
    console.log("Your browser supports LiCAP");

    LiCAPDevice.enumerate().then((devs) => {
        if(devs.length > 0) {
            devs[0].on("pick", 
                (stringIdx, note, amp) => {
                    console.log(note);
            });
        }
    })
} else {
    console.log("Your browser does not support LiCAP");
}

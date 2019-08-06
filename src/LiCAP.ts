

import {Callbacks} from './utils';

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
        this.callbacks = new Callbacks(["data"]);
        
        this.device.onmidimessage(this.onMessage.bind(this));
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
                if(input.name.match(/LiCAP Device/)) {
                    ret.push(new LiCAPDevice(input));
                }
            }
        }
        return ret;
    }

    private onMessage(e: WebMidi.MIDIMessageEvent): void {
        this.callbacks["data"].call(e.data);
    }
}


if(LiCAPDevice.isSupported()) {
    console.log("Your browser supports LiCAP");
} else {
    console.log("Your browser does not support LiCAP");
}

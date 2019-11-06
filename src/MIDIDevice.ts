import {EventEmitter} from './EventEmitter'
import {Callbacks} from './utils'

interface IMIDIInputDevice extends EventEmitter {
    readonly deviceName: string;

    open(): void;
}

export class MIDIInputDevice implements IMIDIInputDevice {
    private device: WebMidi.MIDIInput;
    private callbacks: Callbacks;
    readonly deviceName: string;
    
    /**
     * ctor
     * @param device valid MIDIInput
     */
    private constructor(device: WebMidi.MIDIInput) {
        this.device = device;
        this.deviceName = this.device.name;
        this.callbacks = new Callbacks(["noteon", "noteoff", "message"]);
    }

    on(ename: string, cbk: (...args: any[]) => void): void {
        if(ename in this.callbacks) {
            this.callbacks[ename].push(cbk);
        }
    }

    open(): void {
        this.device.onmidimessage = this.onMessage.bind(this);
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
    static async enumerate(): Promise<Array<IMIDIInputDevice>> {
        let ret: Array<IMIDIInputDevice> = [];

        if(MIDIInputDevice.isSupported()) {
            let access = await navigator.requestMIDIAccess();

            for(let input of access.inputs.values()) {
                // console.log(input.name);
                ret.push(new MIDIInputDevice(input));
                console.log(`device ${input.name}`);
                break;
            }
        }
        return ret;
    }

    private onMessage(e: WebMidi.MIDIMessageEvent): void {
        // Simply parse the data
        let channel = e.data[0] & 0xF;
        switch((e.data[0]>>4) & 0xF) {
            case 8:
                // note off
                // ref: http://midi.teragonaudio.com/tech/midispec/noteoff.htm
                // channel note vol(float) timestamp
                this.callbacks["noteoff"].callAll(channel, e.data[1], e.data[2] / 127.0, e.timeStamp);// string idex, note, vol, time stamp
                break;
            case 9:
                // note on
                // ref: http://midi.teragonaudio.com/tech/midispec/noteon.htm
                this.callbacks["noteon"].callAll(channel, e.data[1], e.data[2] / 127.0, e.timeStamp);// string idex, note, vol, time stamp
                break;
        }
        
    }
}
//A4 = midi note key 69, frequence 440HZ, 12 for a Octave
let stringFrequency = [329.63, 246.94, 196, 146.83, 110, 82.41];
let A4Key = 69;
let A4Frequency = 440;
let octaveSetp = 12;
let unit = Math.pow(Math.E, Math.log(2) / octaveSetp);
export class KeyBoardAdapter {
    static noteKeyToStringData(noteKey: number){
        let frq = KeyBoardAdapter.noteKeyToFrequency(noteKey);
        return KeyBoardAdapter.frequencyToStringData(frq);
    }
    static noteKeyToFrequency(noteKey: number): number{
        let dif = noteKey - A4Key;
        return Math.pow(unit, dif) * A4Frequency;
    }
    /**
     * convert freqency to string index and block index
     * @param freq frequency
     * @returns [ string index, block index]
     */
    static frequencyToStringData(freq: number): [number, number]{
        let string = stringFrequency.length - 1;
        for(let i = 0; i < stringFrequency.length; i++){
            if(freq >= stringFrequency[i]){
                string = i;
                break;
            }
        }
        let block = Math.floor(Math.log(freq/stringFrequency[string])/Math.log(unit));
        return [string, block];
    }
}
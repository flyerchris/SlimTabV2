//A4 = midi note key 69, frequence 440HZ, 12 for a Octave
let stringFrequency = [329.63, 246.94, 196, 146.83, 110, 82.41];
let A4Key = 69;
let A4Frequency = 440;
let octaveSetp = 12;

export class KeyBoardAdapter {
    private unit = Math.pow(Math.E, Math.log(2) / octaveSetp);
    noteKeyToFrequency(noteKey: number): number{
        let dif = noteKey - A4Key;
        return Math.pow(this.unit, dif) * A4Frequency;
    }
    /**
     * convert freqency to string index and block index
     * @param freq frequency
     * @returns [ string index, block index]
     */
    frequencyToStringData(freq: number): [number, number]{
        let string = stringFrequency.length - 1;
        for(let i = 0; i < stringFrequency.length; i++){
            if(freq >= stringFrequency[i]){
                string = i;
                break;
            }
        }
        let block = Math.floor(Math.log(freq/stringFrequency[string])/Math.log(this.unit));
        return [string, block];
    }
}
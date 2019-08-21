import { Correction } from "./SlimTabV2Interface"
import { note, section } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
const instrumentCorrection: Correction = function(sltab: SLTab, addData: note, section: number, note: number): void {
    sltab.notes[section] = sltab.notes[section].slice(0, note + 1);
    let stackLength = 0;// unit in beat
    for(let i = 0; i <= note; i++){
        stackLength += sltab.lengthPerBeat / sltab.notes[section][i][0];
    }
    if(stackLength >= sltab.beatPerSection){
        sltab.notes.splice(section + 1, 0, []);
        sltab.notes[section + 1].push(addData);
    }else if(stackLength + sltab.lengthPerBeat / addData[0] > sltab.beatPerSection){
        let restLength = sltab.beatPerSection - stackLength;
        let addLength = sltab.lengthPerBeat / (sltab.lengthPerBeat / addData[0] - restLength);
        restLength = sltab.lengthPerBeat / restLength;
        sltab.notes[section].push([restLength, addData[1], "linkStart"]);
        sltab.notes.splice(section + 1, 0, []);
        sltab.notes[section + 1].push([addLength, addData[1], "linkEnd"]);   
    }else{
        let noteRestLength = 1 - stackLength % 1; // unit in beat
        if(noteRestLength >= sltab.lengthPerBeat / addData[0]){
            sltab.notes[section].push(addData);
        }else{
            let noteAddLength = sltab.lengthPerBeat / addData[0] - noteRestLength;
            sltab.notes[section].push([sltab.lengthPerBeat / noteRestLength, addData[1], "linkStart"]);
            sltab.notes[section].push([sltab.lengthPerBeat / noteAddLength, addData[1], "linkEnd"]);
        }
    }
}
export { instrumentCorrection };
import { Correction } from "./SlimTabV2Interface"
import { section, Note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
const instrumentCorrection: Correction = function(sltab: SLTab, addData: Note, section: number, note: number): void {
    sltab.deleteNote(section, note + 1 , sltab.getNoteNumberOfSection(section));
    let stackLength = 0;// unit in beat
    for(let i = 0; i <= note; i++){
        stackLength += sltab.lengthPerBeat / sltab.notes[section][i][0];
    }
    if(stackLength >= sltab.beatPerSection){
        sltab.insertSection(-1, []);
        sltab.addNote(section + 1, -1, addData);
    }else if(stackLength + sltab.lengthPerBeat / addData[0] > sltab.beatPerSection){
        let restLength = sltab.beatPerSection - stackLength;
        let addLength = sltab.lengthPerBeat / (sltab.lengthPerBeat / addData[0] - restLength);
        restLength = sltab.lengthPerBeat / restLength;
        sltab.addNote(section, -1, new Note({noteValue: restLength, stringContent: addData[1], userData: "linkStart"}));
        sltab.insertSection(-1, []);
        sltab.addNote(section + 1, -1, new Note({noteValue: addLength, stringContent: addData[1], userData: "linkEnd"})); 
    }else{
        let noteRestLength = 1 - stackLength % 1; // unit in beat
        if(noteRestLength >= sltab.lengthPerBeat / addData[0]){
            sltab.addNote(section, -1, addData);
        }else{
            let noteAddLength = sltab.lengthPerBeat / addData[0] - noteRestLength;
            sltab.addNote(section, -1, new Note({noteValue: sltab.lengthPerBeat / noteRestLength, stringContent: addData[1], userData: "linkStart"}));
            sltab.addNote(section, -1, new Note({noteValue: sltab.lengthPerBeat / noteAddLength, stringContent: addData[1], userData: "linkEnd"}));
        }
    }
}
export { instrumentCorrection };
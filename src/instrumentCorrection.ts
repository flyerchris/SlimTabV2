import { Correction } from "./SlimTabV2Interface"
import { note, section } from "./SlimTabV2Types"
const instrumentCorrection: Correction = function(allData: section[], addData: note, section: number, note: number): void {
    allData[section] = allData[section].slice(0, note + 1);
    let stackLength = 0;// unit in beat
    for(let i = 0; i <= note; i++){
        stackLength += this.lengthPerBeat / allData[section][i][0];
    }
    if(stackLength >= this.beatPerSection){
        allData.splice(section + 1, 0, []);
        allData[section + 1].push(addData);
    }else if(stackLength + this.lengthPerBeat / addData[0] > this.beatPerSection){
        let restLength = this.beatPerSection - stackLength;
        let addLength = this.lengthPerBeat / (this.lengthPerBeat / addData[0] - restLength);
        restLength = this.lengthPerBeat / restLength;
        allData[section].push([restLength, addData[1], "linkStart"]);
        allData.splice(section + 1, 0, []);
        allData[section + 1].push([addLength, addData[1], "linkEnd"]);   
    }else{
        let noteRestLength = 1 - stackLength % 1; // unit in beat
        if(noteRestLength >= this.lengthPerBeat / addData[0]){
            allData[section].push(addData);
        }else{
            let noteAddLength = this.lengthPerBeat / addData[0] - noteRestLength;
            allData[section].push([this.lengthPerBeat / noteRestLength, addData[1], "linkStart"]);
            allData[section].push([this.lengthPerBeat / noteAddLength, addData[1], "linkEnd"]);
        }
    }
}
export { instrumentCorrection };
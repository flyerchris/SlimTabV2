//Tablature
/**
  * render pipeline: caculate each note position and actual note number (calNoteRawData)
  *                 => draw necessary lines (drawAllLine)
  *                 => create enough svg element and reuse them (setAllNoteElementData)
  *                 => set elements data  (setNoteElementData)
  *                  
  */

import { utils } from "./utils"
import { section, note } from "./SlimTabV2Types"
import { Correction } from "./SlimTabV2Interface"

type caculatedNoteData = [number, number, number, number[], number[], number, number]; //[x, y , length, block of every chord, tail length, section index, note index]

export class SLTab {
    private lengthPerBeat: number = 4;
    private beatPerSection: number = 4;
    private lineWidth: number = 800;
    private sectionPerLine: number = 2;
    private stringPadding: number = 16; // distance between each string
    private linePerPage: number = 20;
    private lineMargin: number = 42; // only for left and right
    private linePadding: [number, number] = [32, 14];
    private lineDistance: number = 90; // distance between each line
    private sectionAddNoteNumber = 16;
    private notes: section[];
    private noteElement: SVGElement[] = [];
    private linkerElement: SVGElement[] = [];
    private svgElement: SVGElement;
    private sectionBarElement: SVGElement[] = [];
    private lineElement: SVGElement[] = [];
    private sectionIndicatorElement: SVGElement[] = [];
    private startPosition: number[] = [this.lineMargin + this.linePadding[0] + 20, 120 + this.linePadding[1]]; // x, y
    private lineInfo: [number, number, number] = [0, this.lineMargin, 120]; // total line number, last line X, last line Y

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, lineWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        Object.assign(this, data);
    }

    setNoteData(data: [number, number[], any][][]) {
        this.notes = data;
    }
    
    /**
     * add a note
     * @param { [number, number[], any] }   data, note length, [block number, index is string number,], user data
     * @param { number }                    section, if give -1, note will be appended at last section. Index start from 0
     * @param { number }                    note, if give -1, note will be appended at last note. Index start from 0
     */
    instrumentNoteInput(correction: Correction, data: note, section: number = -1, note: number = -1) {
        if(section == -1)section = this.notes.length - 1;
        if(note == -1)note = this.notes[section].length - 1;
        correction(this.notes, data, section, note);
        this.render();
    }
    
    render(anchor?: Element) {
        if(!this.svgElement){ // mount on an element
            let page = document.createElement("div");
            let width = this.lineWidth + this.linePadding[0]*2 + 42*2;
            page.setAttribute("style",`position: relative; background: radial-gradient(#3E3E3E, #000) ; width: fit-content;`);
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg',"svg");
            utils.setAttributes(this.svgElement,{width: `${width}`, height: "600"});
            this.svgElement.innerHTML = "<g></g><g></g><g></g><g></g>"; // lines, section indicator, notes, linker
            page.append(this.svgElement);
            anchor.appendChild(page);
        }
        this.setAllLine();
        let [noteRawData, linkerData, sectionPosition] = this.calNoteRawData();
        this.setSectionIndicator(sectionPosition);
        this.setAllNoteElementData(noteRawData);
        this.setLinker(linkerData);
    }
    private setAllLine() {
        let ln = Math.ceil(this.notes.length / this.sectionPerLine);
        if(ln > this.lineInfo[0]){
            for(let i = 0; i < ln - this.lineInfo[0]; i++){
                let nl = this.createLine(this.lineInfo[1], this.lineInfo[2], i);
                this.lineElement.push(nl);
                this.svgElement.children[0].appendChild(nl);
                this.lineInfo[2] += this.stringPadding * 5 + this.lineDistance;
            }
        }
        this.lineInfo[0] = ln;
    }
    private setSectionIndicator(position: [number[], number[]][]){
        if(position.length > this.sectionIndicatorElement.length){
            let nsNumber = position.length - this.sectionIndicatorElement.length;
            for(let i = 0; i < nsNumber; i++){
                let ns = this.createSectionIndicator();
                this.svgElement.children[1].appendChild(ns);
                this.sectionIndicatorElement.push(ns);
            }
        }
        for(let i = 0; i < position.length; i++){
            let width = position[i][1][0] - position[i][0][0];
            let height = this.stringPadding * 5;
            utils.setAttributes(this.sectionIndicatorElement[i], {x: `${position[i][0][0]}`, y: `${position[i][0][1]}`, width: `${width}`, height: `${height}`});
        }
    }
    private createSectionIndicator(): SVGElement{
        let square = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(square, {"stroke-width": "0", fill: "rgba(0, 255, 255, 0.13)"});
        return square;
    }
    private createLine(x: number, y: number, lineNumber: number): SVGElement {
        let ng = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let lineBack = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(lineBack,{x: `${x}`, y:`${y}`,style: "fill: rgba(255, 255, 255, 0.09)", width:`${this.linePadding[0]*2 + this.lineWidth}`, height: `${this.linePadding[1]*2 + this.stringPadding * 5}`});
        ng.appendChild(lineBack);
        x += this.linePadding[0];
        y += this.linePadding[1];
        for(let i = 0; i < 6; i++){
            let l = this.lineWidth;
            let newLine = document.createElementNS('http://www.w3.org/2000/svg',"line");
            utils.setAttributes(newLine,{x1: `${x}`, y1: `${y + i*this.stringPadding}`, x2: `${x + l}`, y2: `${y + i*this.stringPadding}`, style: "stroke:rgba(255, 255, 255, 0.24) ;stroke-width:2"});
            ng.appendChild(newLine);
        }
        ng.appendChild(this.drawLineTitle(x - 30, y));
        ng.appendChild(this.createBar(x , y));
        for(let i = 0; i < this.sectionPerLine; i++){
            let bar = this.createBar(0, 0);
            this.sectionBarElement.push(bar);
            ng.appendChild(bar);
        }

        return ng;
    }
    private drawLineTitle(x: number, y: number): SVGElement {
        let title = document.createElementNS('http://www.w3.org/2000/svg',"g");
        title.innerHTML = `
        <text style="fill:#959595;font:17px arial;">
            <tspan x='${x + 10}' y='${y + 26}'>T</tspan>
            <tspan x='${x + 10}' y='${y + 22 + 26}'>A</tspan>
            <tspan x='${x + 10}' y='${y + 44 + 26}'>B</tspan>
        </text>
        `;
        return title;
    }
    private createBar(x: number, y: number): SVGElement {
        let bar = document.createElementNS('http://www.w3.org/2000/svg',"line");
        utils.setAttributes(bar,{style: 'stroke:rgba(255, 255, 255, 0.24) ;stroke-width:2'})
        utils.setAttributes(bar,{x1: `${x}`, y1: `${y}`, x2: `${x}`, y2: `${y + this.stringPadding * 5}`})
        return bar;
    }

    private setBarPosition(bar:SVGElement, x: number, y: number){
        utils.setAttributes(bar,{x1: `${x}`, y1: `${y}`, x2: `${x}`, y2: `${y + this.stringPadding * 5}`})
    }

    private createNoteElement(x: number = 200, y:number = 20){
        let note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let noteHtml = `<g>
        <line style="stroke:white;stroke-width:1" x1="${x}" y1="140" x2="${x}" y2="${y}"></line>
        <line style="stroke:white;stroke-width:2" x1="${x}" y1="138" x2="${x+10}" y2="138"></line>
        <line style="stroke:white;stroke-width:2" x1="${x}" y1="130" x2="${x+10}" y2="130"></line>
        <line style="stroke:white;stroke-width:2"></line>
        </g>`;
        for(let i = 0; i < 6 ; i++){
            noteHtml += `
                <g>
                <ellipse cx='${x}' cy='${y + this.stringPadding * i}' rx='4' ry='6' fill='#444' stroke-width='0' stroke='black' style='cursor:pointer;'></ellipse>
                <text x='${x }' y='${y + this.stringPadding * i + 4}' text-anchor="middle" style="font:12px Sans-serif; fill:#fff">3</text>
                </g>
            `;
        }
        note.innerHTML = noteHtml;
        this.svgElement.children[2].appendChild(note);
        this.noteElement.push(note);
    }
    /**
     * @return { caculatedNoteData[], number[][] } array of [x, y , length, block of every chord, tail length, section index, note index], linker data, section x position
     */
    private calNoteRawData():[ caculatedNoteData[], number[][], [number[], number[]][] ]{
        let [x, y] = this.startPosition;
        let rawData: caculatedNoteData[] = [];
        let sectionLength = this.beatPerSection / this.lengthPerBeat;
        let linker = [];
        let sectionIndicator: [number[], number[]][] = [];
        let seperaterLength = 1 / 4;
        let accumulatedLength = 0;
        rawData.push([0, 0, 0, null, null, 0, 0]); // give a initial data, remove it at the end of function

        for(let s = 0; s < this.notes.length; s++){ // section
            let line = Math.floor(s / this.sectionPerLine);
            let lineTotalNote = 0;
            for(let i = 0; i < this.sectionPerLine; i++){
                if(this.notes[line * this.sectionPerLine + i]){
                    lineTotalNote += this.notes[line * this.sectionPerLine + i].length + this.sectionAddNoteNumber;
                }else{
                    lineTotalNote += this.sectionAddNoteNumber;
                }
            }
            let sectionWidth = this.lineWidth * (this.notes[s].length + this.sectionAddNoteNumber) / lineTotalNote;
            let sectionTotalBeat = 0;
            for(let i = 0; i < this.notes[s].length; i++){
                sectionTotalBeat += this.lengthPerBeat /this.notes[s][i][0];
            }
            let beatLength = (sectionWidth - 20) / sectionTotalBeat;

            if(s % this.sectionPerLine == 0){ // change line
                x = this.startPosition[0];
                if(s != 0)y += this.stringPadding * 5 + this.lineDistance;
            }
            let sx: [number[], number[]] = [[x - 20, y], [0, y]]; // section position
            let nx = x + sectionWidth;
            sx[1][0] = nx - 20;
            this.setBarPosition(this.sectionBarElement[s], nx -20, y);
            sectionIndicator.push(sx);
            for(let i = 0; i < this.notes[s].length; i++){ // note
                let note = this.notes[s][i];
                let noteLength = this.lengthPerBeat / note[0];
                let tail: number[];
                if(accumulatedLength + noteLength / this.lengthPerBeat >= seperaterLength){ // the note is the end of a seperater or the note's length equals to seperater length
                    tail = this.calculateTail(rawData[rawData.length - 1][2], note[0], -1, beatLength);
                    accumulatedLength = 0;
                }else{
                    tail = this.calculateTail(rawData[rawData.length - 1][2], note[0], accumulatedLength, beatLength);
                    accumulatedLength += noteLength / this.lengthPerBeat;
                }
                let step = beatLength * this.lengthPerBeat / note[0];
                rawData.push([x, y, note[0], note[1], tail, s, i]);
                if(note[2] === "linkStart" || note[2] === "linkEnd"){
                    linker.push([x,y]);
                }
                x += step;
            }
            x = nx;
        }
        rawData.shift();
        return [rawData, linker, sectionIndicator];
    }

    private calculateTail(lastNoteLength: number, noteLength: number, accumulatedLength: number, beatLength: number): number[]{
        let step = beatLength * this.lengthPerBeat / lastNoteLength * -1;
        let basicLength = 8;
        if(accumulatedLength == -1)basicLength = -8;
        if(accumulatedLength == 0){ // start of a seperate note
            if(noteLength == 8){
                return [8, 0, 0];
            }else if(noteLength == 16){
                return [8, 8, 0];
            }else if(noteLength == 32){
                return [8, 8, 8];
            }
        }else{
            if(noteLength == 8){
                if(lastNoteLength == 8 || lastNoteLength == 16 || lastNoteLength == 32){
                    return [step, 0, 0];
                }
            }else if(noteLength == 16){
                if(lastNoteLength == 8 ){
                    return [step, basicLength, 0];
                }else if(lastNoteLength == 16 || lastNoteLength == 32){
                    return [step, step, 0];
                }
            }else if(noteLength == 32){
                if(lastNoteLength == 8){
                    return [step, basicLength, basicLength];
                }else if(lastNoteLength == 16){
                    return [step, step, basicLength];
                }else if(lastNoteLength == 32){
                    return [step, step, step];
                }
            }
        }
        return [0, 0, 0];
    }
    /**
     * receive data from calNoteRawData and set elements
     * @param { [number, number, number, number[]][] } data 
     */
    private setAllNoteElementData(data: caculatedNoteData[]){
        let ne = data.length - this.noteElement.length;
        for(let i = 0; i < ne; i++){
            this.createNoteElement();
        }
        for(let i = 0; i < data.length; i++){
            utils.setStyle(<HTMLElement><unknown>this.noteElement[i],{ display: "unset"});
            this.setNoteElementData(this.noteElement[i], data[i]);
        }
        for(let i = data.length; i < this.noteElement.length; i++){
            utils.setStyle(<HTMLElement><unknown>this.noteElement[i],{ display: "none"});
        }
    }
    private setNoteElementData(el:SVGElement, data: caculatedNoteData){
        this.setElementPosition(el, data[0], data[1], data[4], data[5], data[6]);
        this.setChordVisiable(el, data[1], data[3]);
    }
    private setElementPosition(e:SVGElement, x:number, y:number, tail: number[], sectionIndex: number, noteIndex: number){
        // set note bar's position and bar tail's length
        utils.setAttributes(e.children[0].children[0],{x1: `${x}`, y1: `${26 + y + this.stringPadding * 5}`, x2: `${x}`, y2: `${y}`});
        utils.setAttributes(e.children[0].children[1],{x1: `${x}`, y1: `${25 + y + this.stringPadding * 5}`, x2: `${x + tail[0]}`, y2: `${25 + y + this.stringPadding * 5}`});
        utils.setAttributes(e.children[0].children[2],{x1: `${x}`, y1: `${21 + y + this.stringPadding * 5}`, x2: `${x + tail[1]}`, y2: `${21 + y + this.stringPadding * 5}`});
        utils.setAttributes(e.children[0].children[3],{x1: `${x}`, y1: `${17 + y + this.stringPadding * 5}`, x2: `${x + tail[2]}`, y2: `${17 + y + this.stringPadding * 5}`});
        // set note word position
        for(let i = 1 ; i <= 6; i++){
            utils.setAttributes(e.children[i].children[0], {cx: `${x}`, cy: `${y + this.stringPadding * (i-1)}`});
            utils.setAttributes(e.children[i].children[1], {x: `${x}`, y: `${y + this.stringPadding * (i-1) + 4}`});
        }
        utils.setAttributes(e, {"data-section": `${sectionIndex}`, "data-note": `${noteIndex}`});
    }
    private setChordVisiable(e:SVGElement, y: number, data: number[]){
        for(let i = 1 ; i <= 6; i++){
            e.children[i].children[1].innerHTML = `${data[i-1]}`;
            if(data[i-1] == -1){
                utils.setStyle(<HTMLElement>e.children[i].children[0],{display: "none"});
                utils.setStyle(<HTMLElement>e.children[i].children[1],{display: "none"});
            }else{
                utils.setStyle(<HTMLElement>e.children[i].children[0],{display: "block"});
                utils.setStyle(<HTMLElement>e.children[i].children[1],{display: "block"});
            }
        }
        
        // note bar should reach the top word
        let hc: number = -1;
        for(let i = 0 ; i < 6; i++){
            if(data[i] != -1){
                hc = i;
                break;
            }    
        }
        if(hc != -1){
            utils.setAttributes(e.children[0].children[0],{y2: `${y + this.stringPadding * hc}`});
            utils.setStyle(<HTMLElement>e.children[0].children[0],{display: "block"});
        }else{
            utils.setStyle(<HTMLElement>e.children[0].children[0],{display: "none"});
        }
    }

    private setLinker(linkerData: number[][]){
        let lenumber = Math.floor(linkerData.length / 2);
        let existNumber = this.linkerElement.length
        for(let i = 0; i < lenumber - existNumber; i++){
            this.createLinkerElement();
        }
        for(let i = 0; i < lenumber; i++){
            this.setLinkerData(this.linkerElement[i], linkerData[i*2], linkerData[i*2+1]);
        }
    }
    private createLinkerElement(){
        let linker = document.createElementNS('http://www.w3.org/2000/svg',"path");
        this.svgElement.children[3].appendChild(linker);
        utils.setAttributes(linker, {fill: `white`});
        this.linkerElement.push(linker);
    }
    private setLinkerData(linkElement:SVGElement, start: number[], end: number[]){
        let ly = start[1] + 31 + this.stringPadding * 5;
        if(start[1] !== end[1]){
            let ex = start[0] + 30;
            let sx = start[0];
            let path = `M ${sx} ${ly} C ${sx+4} ${ly+15}, ${ex-4} ${ly+15}, ${ex} ${ly} C ${ex-4} ${ly+12}, ${sx+4} ${ly+12}, ${sx} ${ly} `;
            ly = end[1] + 31 + this.stringPadding * 5;
            sx = end[0] - 30;
            ex = end[0];
            path += `M ${sx} ${ly} C ${sx+4} ${ly+15}, ${ex-4} ${ly+15}, ${ex} ${ly} C ${ex-4} ${ly+12}, ${sx+4} ${ly+12}, ${sx} ${ly}`;
            utils.setAttributes(linkElement, {d: path});
        }else{
            utils.setAttributes(linkElement, {d: `M ${start[0]} ${ly} C ${start[0]+4} ${ly+15}, ${end[0]-4} ${ly+15}, ${end[0]} ${ly} C ${end[0]-4} ${ly+12}, ${start[0]+4} ${ly+12}, ${start[0]} ${ly}`});
        }
    }
}
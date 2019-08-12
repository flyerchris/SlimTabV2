//Tablature

import {utils} from "./utils"
 /**
  * render pipeline: draw necessary lines (drawAllLine)
  *                 => caculate each note position (calNoteRawData)
  *                 => create enough svg element and reuse them (setAllNoteElementData)
  *                 => set elements data  (setNoteElementData)
  *                  
  */

export class SLTab {
    private lengthPerBeat: number = 4;
    private beatPerSection: number = 4;
    private sectionWidth: number = 400; // unit in pixel
    private sectionPerLine: number = 2;
    private stringPadding: number = 16; // distance between each string
    private linePerPage: number = 20;
    private lineMargin: number = 42; // only for left and right
    private linePadding: [number, number] = [32, 14];
    private lineDistance: number = 90; // distance between each line
    private notes: [number, number[], any][][];
    private noteElement: SVGElement[] = [];
    private svgElement: SVGElement;
    private startPosition: number[] = [this.lineMargin + this.linePadding[0] + 20, 120 + this.linePadding[1]]; // x, y
    private lineInfo: [number, number, number] = [0, this.lineMargin, 120]; // total line number, last line X, last line Y

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, sectionWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        Object.assign(this, data);
    }

    /**
    notes data example :
    [
        [// section
            [4, [3, -1, -1, 4, -1, -1], null], // note length, [block number, index is string number,], user data
            [8, [-1, 5, 2, -1, -1, -1], null],
        ],
        [
            [16, [-1, 5, 2, -1, -1, -1], null],
        ],
    ]
    */
    setNoteData(data: [number, number[], any][][]) {
        this.notes = data;
    }
    
    /**
     * add a note
     * @param { number }                    section, if give -1, note will be appended at last section
     * @param { [number, number[], any] }   data
     */
    addNote(section: number, data: [number, number[], any]) {
        if(section == -1){
            let nl = this.notes.length;
            let tl = this.lengthPerBeat / data[0];
            for(let i = 0; i < this.notes[nl-1].length; i++){
                tl += this.lengthPerBeat / this.notes[nl-1][i][0];
            }
            if(tl > this.beatPerSection){
                this.notes[nl-1].push(data);
                this.notes.push([]);
            }else{
                this.notes[nl-1].push(data);
            }
        }else{
            this.notes[section].push(data);
        }
        this.render();
    }
    
    render(anchor?: Element) {
        if(!this.svgElement){ // mount on an element
            let page = document.createElement("div");
            let width = this.sectionWidth * this.sectionPerLine + this.linePadding[0]*2 + 42*2;
            page.setAttribute("style",`position: relative; background: radial-gradient(#3E3E3E, #000) ; width: fit-content;`);
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg',"svg");
            utils.setAttributes(this.svgElement,{width: `${width}`, height: "600"});
            this.svgElement.innerHTML = "<g></g><g></g>"; // lines, notes
            page.append(this.svgElement);
            anchor.appendChild(page);
        }
        let noteRawData = this.calNoteRawData();
        this.drawAllLine();
        this.setAllNoteElementData(noteRawData);
    }
    private drawAllLine() {
        let ln = Math.ceil(this.notes.length / this.sectionPerLine);
        if(ln > this.lineInfo[0]){
            for(let i = 0; i < ln - this.lineInfo[0]; i++){
                let nl = this.drawLine(this.lineInfo[1], this.lineInfo[2]);
                this.svgElement.children[0].appendChild(nl);
                this.lineInfo[2] += this.stringPadding * 5 + this.lineDistance;
            }
        }
        this.lineInfo[0] = ln;
    }
    private drawLine(x: number, y: number): SVGElement {
        let ng = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let lineBack = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(lineBack,{x: `${x}`, y:`${y}`,style: "fill: rgba(255, 255, 255, 0.09)", width:`${this.linePadding[0]*2 + this.sectionWidth * this.sectionPerLine}`, height: `${this.linePadding[1]*2 + this.stringPadding * 5}`});
        ng.appendChild(lineBack);
        x += this.linePadding[0];
        y += this.linePadding[1];
        for(let i = 0; i < 6; i++){
            let l = this.sectionPerLine * this.sectionWidth;
            let newLine = document.createElementNS('http://www.w3.org/2000/svg',"line");
            utils.setAttributes(newLine,{x1: `${x}`, y1: `${y + i*this.stringPadding}`, x2: `${x + l}`, y2: `${y + i*this.stringPadding}`, style: "stroke:rgba(255, 255, 255, 0.24) ;stroke-width:2"});
            ng.appendChild(newLine);
        }
        ng.appendChild(this.drawLineTitle(x - 30, y));

        ng.appendChild(this.drawBar(x , y));
        for(let i = 1; i < this.sectionPerLine + 1; i++){
            ng.appendChild(this.drawBar(x + this.sectionWidth*i, y));
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
    private drawBar(x: number, y: number): SVGElement {
        let bar = document.createElementNS('http://www.w3.org/2000/svg',"line");
        utils.setAttributes(bar,{style: 'stroke:rgba(255, 255, 255, 0.24) ;stroke-width:2'})
        utils.setAttributes(bar,{x1: `${x}`, y1: `${y}`, x2: `${x}`, y2: `${y + this.stringPadding * 5}`})
        return bar;
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
        this.svgElement.children[1].appendChild(note);
        this.noteElement.push(note);
    }
    /**
     * @return { [number, number, number, number[]][] } array of [x, y , length, block of every chord, tail length]
     */
    private calNoteRawData(): [number, number, number, number[], number[]][]{
        let [x, y] = this.startPosition;
        let beatLength = (this.sectionWidth - 20) / this.beatPerSection;
        let rawData: [number, number, number, number[], number[]][] = [];
        let sectionLength = this.beatPerSection / this.lengthPerBeat;
        let seperaterLength = 1 / 4;
        let accumulatedLength = 0;

        for(let s = 0; s < this.notes.length; s++){ //adjust section data
            for(let i = 0; i < this.notes[s].length; i++){
                let note = this.notes[s][i];
                let noteLength = 1 / note[0];
                if(accumulatedLength + noteLength > sectionLength){
                    let restLength = accumulatedLength + noteLength - sectionLength;
                    note[0] = 1 / (noteLength - restLength);
                    if(!this.notes[s + 1])this.notes[s + 1] = [];
                    this.notes[s + 1].splice(0, 0 , [1 / restLength, note[1], null]);
                    accumulatedLength = restLength;
                }else{
                    accumulatedLength += noteLength;
                    if(accumulatedLength == sectionLength)accumulatedLength = 0;
                }
            }
        }

        accumulatedLength = 0;
        for(let s = 0; s < this.notes.length; s++){ // section
            if(s % this.sectionPerLine == 0){ // change line
                x = this.startPosition[0];
                if(s != 0)y += this.stringPadding * 5 + this.lineDistance;
            }
            let nx = x + this.sectionWidth;
            for(let i = 0; i < this.notes[s].length; i++){ // note
                let note = this.notes[s][i];
                let noteLength = this.lengthPerBeat / note[0];
                let tail: number[];
                let originalAccumulatedLength = accumulatedLength;
                if(accumulatedLength + noteLength / this.lengthPerBeat > seperaterLength){
                    let restLength = accumulatedLength + noteLength / this.lengthPerBeat - seperaterLength;
                    note[0] = 1 / (noteLength / this.lengthPerBeat - restLength);
                    this.notes[s].splice(i + 1, 0 , [1 / restLength, note[1], null]);
                    accumulatedLength = restLength;
                    tail = this.calculateTail(rawData[rawData.length - 1][2], note[0], -1);
                }else{
                    accumulatedLength += noteLength / this.lengthPerBeat;
                    if(accumulatedLength == seperaterLength){
                        accumulatedLength = 0;
                        if(rawData.length == 0){
                            tail = this.calculateTail(0 , note[0], originalAccumulatedLength);
                        }else{
                            tail = this.calculateTail(rawData[rawData.length - 1][2], note[0], -1);
                        }
                    }else{
                        if(rawData.length ==0){
                            tail = this.calculateTail(0 , note[0], originalAccumulatedLength);
                        }else{
                            tail = this.calculateTail(rawData[rawData.length - 1][2], note[0], originalAccumulatedLength);
                        }
                    }
                }
                let step = beatLength * this.lengthPerBeat / note[0];
                rawData.push([x, y, note[0], note[1], tail]);
                x += step;
            }
            x = nx;
        }
        return rawData;
    }

    private calculateTail(lastNoteLength: number, noteLength: number, accumulatedLength: number): number[]{
        let beatLength = (this.sectionWidth - 20) / this.beatPerSection;
        let step = beatLength * this.lengthPerBeat / lastNoteLength * -1;
        if(accumulatedLength == 0){ // start of a seperate note
            if(noteLength == 8){
                return [8, 0, 0];
            }else if(noteLength == 16){
                return [8, 8, 0];
            }else if(noteLength == 32){
                return [8, 8, 8];
            }
        }else if(accumulatedLength == -1){ // end of a seperate note;
            if(noteLength == 8){
                if(lastNoteLength == 8){
                    return [step, 0, 0];
                }else if(lastNoteLength == 16){
                    return [step, 0, 0];
                }else if(lastNoteLength == 32){
                    return [step, 0, 0];
                }
            }else if(noteLength == 16){
                if(lastNoteLength == 8){
                    return [step, -8, 0];
                }else if(lastNoteLength == 16){
                    return [step, step, 0];
                }else if(lastNoteLength == 32){
                    return [step, step, 0];
                }
            }else if(noteLength == 32){
                if(lastNoteLength == 8){
                    return [step, -8, -8];
                }else if(lastNoteLength == 16){
                    return [step, step, -8];
                }else if(lastNoteLength == 32){
                    return [step, step, step];
                }
            }
        }else{
            if(noteLength == 8){
                if(lastNoteLength == 8){
                    return [step, 0, 0];
                }else if(lastNoteLength == 16){
                    return [step, 0, 0];
                }else if(lastNoteLength == 32){
                    return [step, 0, 0];
                }
            }else if(noteLength == 16){
                if(lastNoteLength == 8){
                    return [step, 8, 0];
                }else if(lastNoteLength == 16){
                    return [step, step, 0];
                }else if(lastNoteLength == 32){
                    return [step, step, 0];
                }
            }else if(noteLength == 32){
                if(lastNoteLength == 8){
                    return [step, 8, 8];
                }else if(lastNoteLength == 16){
                    return [step, step, 8];
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
    private setAllNoteElementData(data: [number, number, number, number[], number[]][]){
        let ne = data.length - this.noteElement.length;
        for(let i = 0; i < ne; i++){
            this.createNoteElement();
        }
        for(let i = 0; i < data.length; i++){
            this.setNoteElementData(this.noteElement[i], data[i]);
        }
    }
    private setNoteElementData(el:SVGElement, data: [number, number, number, number[], number[]]){
        this.setElementPosition(el, data[0], data[1], data[4]);
        this.setChordVisiable(el, data[1], data[3]);
    }
    private setElementPosition(e:SVGElement, x:number, y:number, tail: number[]){
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
}
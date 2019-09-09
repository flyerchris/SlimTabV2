import {utils, Callbacks} from "./utils"
import { section, note } from "./SlimTabV2Types"
import { Correction } from "./SlimTabV2Interface"
import { SLCanvas, SLLayer, SVGNote } from "./SlimTabV2Canvas"

type caculatedNoteData = [number, number, number, number[], number[], number, number]; //[x, y , length, block of every chord, tail length, section index, note index]
interface eventCallBackInterface {
    noteclick: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    keydown: (key: string) => any;
    mouseovernote: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    mouseoutnote: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    noteshiftclick: (section: number, note: number, string: number, position: number[], currentTarget: HTMLElement) => any;
    notealtclick: (section: number, note: number, string: number, position: number[], currentTarget: HTMLElement) => any;
    mousedown: (x: number, y: number) => any;
    mousemove: (x: number, y: number) => any;
    mouseup: (x: number, y: number) => any;
}
export class SLTab {
    tabCanvas: SLCanvas<SLLayer>;
    notes: section[];
    domElement: HTMLElement;
    readonly lengthPerBeat: number = 4;
    readonly beatPerSection: number = 4;
    private lineWidth: number = 1200;
    private sectionPerLine: number = 4;
    private stringPadding: number = 16; // distance between each string
    private linePerPage: number = 20;
    private lineMargin: number = 42; // only for left and right
    private linePadding: [number, number] = [32, 14];
    private lineDistance: number = 90; // distance between each line
    private sectionAddNoteNumber = 16;
    private linkerElement: SVGElement[] = [];
    private sectionIndicatorElement: SVGElement[] = [];
    private startPosition: number[] = [this.lineMargin + this.linePadding[0] + 20, 120 + this.linePadding[1]]; // x, y
    private lineStartPosition: [number, number] = [this.lineMargin, 120]; // total line number, last line X, last line Y
    
    /**
     * Callbacks
     * Available callbacks
     * noteclick: triggered when a note element is clicked
     */
    private callbacks: Callbacks;

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, lineWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        Object.assign(this, data);
        this.tabCanvas = new SLCanvas<SLLayer>(SLLayer);
        let width = this.lineWidth + this.linePadding[0]*2 + 42*2;
        utils.setAttributes(this.tabCanvas.domElement,{width: `${width}`});
        this.domElement = document.createElement("div");
        this.domElement.append(this.tabCanvas.domElement);
        utils.setStyle(this.domElement, {"width": `${width + 20}px`, height: "700px", "overflow-y": "auto", "overflow-x": "hidden"});
        //if add new event, you should describe the callback in eventCallBackInterface above
        this.callbacks = new Callbacks(["noteclick", "noteshiftclick", "notealtclick", "keydown", "mouseovernote", "mouseoutnote", , "mousedown", "mousemove", "mouseup"]);
        this.tabCanvas.domElement.addEventListener("focus", ()=>{});
        this.tabCanvas.domElement.addEventListener("keydown", this.onKeydown.bind(this));
        this.tabCanvas.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.tabCanvas.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.tabCanvas.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    //todo: do a stricter check for these function
    setData(data: [number, number[], any][][]) {
        this.notes = data;
    }

    getNoteData(section: number, note: number): note{
        return this.notes[section][note];
    }
    
    setNoteData(section: number, note: number, data: note){
        this.notes[section][note] = data;
    }

    deleteNote(section: number, note: number){
        this.notes[section].splice(note, 1);
    }

    addNote(section: number, note: number, data: note){
        if(section >= this.notes.length){
            section = this.notes.length;
            this.notes.push([]);
        }
        this.notes[section].splice(note, 0, data);
    }

    
    isBlankNote(section: number, note: number){
        for(let i = 0; i < 6; i++){
            if(this.notes[section][note][1][i] != -1){
                return false;
            }
        }
        return true;
    }

    getSVGNote(section: number, note: number): SVGNote{
        let noteElements = this.tabCanvas.layers.notes.noteElements;
        return noteElements.find((elem) => {
            return elem.section == section && elem.note == note
        })
    }

    getNotePosition(section: number, note: number, string: number = 0): [number, number]{
        let sum = 0;
        if(section == -1) section = this.notes.length -1;
        if(note == -1) note = this.notes[section].length -1;
        if(section >= this.notes.length || section < -1 || note >= this.notes[section].length || note < -1 || string > 5 || string < 0){
            return [-1, -1];
        }
        for(let i = 0; i < section; i++){
            sum += this.notes[i].length;
        }
        sum += note;
        let sel = this.tabCanvas.layers.notes.noteElements[sum].blockGroup[string];
        return [sel.x, sel.y];
    }

    getNoteNumberOfSection(section: number){
        if(section == -1) section = this.notes.length - 1;
        return this.notes[section].length;
    }

    getSectionNumber(){
        return this.notes.length;
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
        correction(this, data, section, note);
        this.render();
    }
    
    attach(anchor: HTMLElement){
        anchor.append(this.domElement);
    }

    noteIndex(note: SVGNote){
        return this.tabCanvas.layers.notes.noteElements.indexOf(note);
    }
        /**
     * Drag and drog area select notes
     * Bad implement by now, the function search each note to find collision
     * Algorithm will be fixed in future.
     */
    areaSelect(x1: number, y1: number, x2: number, y2: number){
        let noteElements = this.tabCanvas.layers.notes.noteElements;
        var selectedNoteIds: number[] = [];
        let leftSelectedNote: number;
        let rightSelectedNote: number;
        for(let i = 0; i < noteElements.length; i++){
            for(let j = 0; j < 6; j++){
                //Check if note is in the selected area
                if(noteElements[i].blockGroup[j].x >= x1 
                    && noteElements[i].blockGroup[j].x <= x2 
                    && noteElements[i].blockGroup[j].y >=y1 
                    && noteElements[i].blockGroup[j].y <=y2){
                    selectedNoteIds.push(i);
                    console.log(i);
                }
            }
        }
        console.log(selectedNoteIds);
        leftSelectedNote = Math.min(...selectedNoteIds);
        rightSelectedNote = Math.max(...selectedNoteIds);
        console.log(noteElements.slice(leftSelectedNote, rightSelectedNote+1));
        return noteElements.slice(leftSelectedNote, rightSelectedNote+1);
    }
    endsSelect(head: number, tail: number){
        if(head > tail){
            let temp = tail;
            tail = head;
            head = temp;
        }
        return this.tabCanvas.layers.notes.noteElements.slice(head, tail+1);
    }
    render() {
        this.setAllLine();
        let [noteRawData, linkerData, sectionPosition] = this.calNoteRawData();
        this.setSectionIndicator(sectionPosition);
        this.setAllNoteElementData(noteRawData);
        this.setLinker(linkerData);
        let ln = Math.ceil(this.notes.length / this.sectionPerLine);
        utils.setAttributes(this.tabCanvas.domElement,{ height: `${this.lineStartPosition[1] + (this.stringPadding * 5 + this.lineDistance) * ln + 70}`});
    }

    on<k extends keyof eventCallBackInterface>(ename: k, cbk: eventCallBackInterface[k]) {
        if(ename in this.callbacks) {
            this.callbacks[ename].push(cbk);
        }
    }

    scrollTo(val: number){
        this.domElement.scrollTop = val;
    }
    private setAllLine() {
        let ln = Math.ceil(this.notes.length / this.sectionPerLine); // number of row you need
        let an = this.tabCanvas.layers.sheet.row.length; // number of row you have
        for(let i = an; i < ln ; i++){
            let x = this.lineStartPosition[0];
            let y = this.lineStartPosition[1] + (this.stringPadding * 5 + this.lineDistance) * i;
            this.tabCanvas.layers.sheet.createRow(x, y, this.lineWidth, this.linePadding, this.stringPadding, this.sectionPerLine);
        }
        for(let i = ln; i < an; i++){
            utils.setStyle(this.tabCanvas.layers.sheet.row[i], {display: "none"});
        }
        for(let i = 0; i < ln; i++){
            utils.setStyle(this.tabCanvas.layers.sheet.row[i], {display: "unset"})
        }
    }
    private setSectionIndicator(position: [number[], number[]][]){
        if(position.length > this.sectionIndicatorElement.length){
            let nsNumber = position.length - this.sectionIndicatorElement.length;
            for(let i = 0; i < nsNumber; i++){
                this.tabCanvas.layers.ui.createSectionIndicator();
            }
        }
        for(let i = 0; i < position.length; i++){
            let width = position[i][1][0] - position[i][0][0];
            let height = this.stringPadding * 5;
            this.tabCanvas.layers.ui.sectionIndicator[i].x = position[i][0][0]
            this.tabCanvas.layers.ui.sectionIndicator[i].y = position[i][0][1]
            this.tabCanvas.layers.ui.sectionIndicator[i].width = width
            this.tabCanvas.layers.ui.sectionIndicator[i].height = height
            //utils.setAttributes(this.tabCanvas.layers.ui.sectionIndicator[i], {x: `${position[i][0][0]}`, y: `${position[i][0][1]}`, width: `${width}`, height: `${height}`});
        }
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
            accumulatedLength = 0;
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
            this.tabCanvas.layers.sheet.bar[s].x1 = nx - 20;
            this.tabCanvas.layers.sheet.bar[s].x2 = nx - 20;
            sectionIndicator.push(sx);
            for(let i = 0; i < this.notes[s].length; i++){ // note
                let note = this.notes[s][i];
                let noteLength = this.lengthPerBeat / note[0];
                let tail: number[];
                if(accumulatedLength + noteLength / this.lengthPerBeat >= seperaterLength){ // the note is the end of a beat or the note's length equals to a beat
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
                return [basicLength, 0, 0];
            }else if(noteLength == 16){
                return [basicLength, basicLength, 0];
            }else if(noteLength == 32){
                return [basicLength, basicLength, basicLength];
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
        let noteElement = this.tabCanvas.layers.notes.noteElements
        let ne = data.length - noteElement.length;
        let nullData: caculatedNoteData = [0, 0, 0, [-1, -1, -1, -1, -1, -1], [0, 0, 0], 0, 0];
        for(let i = 0; i < ne; i++){
            this.tabCanvas.layers.notes.createNote();
            noteElement[noteElement.length - 1].blockGroup.forEach((wg, i) => {
                wg.domelement.addEventListener("click", this.onNoteClicked.bind(this));
                wg.domelement.addEventListener("mouseover", this.onMouseOverNote.bind(this));
                wg.domelement.addEventListener("mouseout", this.onMouseOutNote.bind(this));
                wg.string = i;
                utils.setAttributes(wg.domelement, {"data-string": `${i}`});
            });
        }
        for(let i = 0; i < data.length; i++){
            utils.setStyle(noteElement[i].domelement,{ display: "unset"});
            if(i != data.length - 1){
                if(data[i+1][0] > data[i][0]){
                    this.setNoteElementData(noteElement[i], data[i], data[i + 1], (data[i+1][0] - data[i][0]) * 0.7);
                }else{
                    this.setNoteElementData(noteElement[i], data[i], data[i + 1], 30);
                }
            }else{
                this.setNoteElementData(noteElement[i], data[i], nullData, 30);
            }
        }
        for(let i = data.length; i < noteElement.length; i++){
            utils.setStyle(noteElement[i].domelement,{ display: "none"});
        }
    }
    private setNoteElementData(el: SVGNote, data: caculatedNoteData, nexData:caculatedNoteData ,xlength: number){
        this.setElementPosition(el, data[0], data[1], data[4], data[5], data[6], xlength);
        this.setChordVisiable(el, data[0], data[1], data[2], data[3], data[4], nexData[4]);
    }
    
    private setElementPosition(e: SVGNote, x:number, y:number, tail: number[], sectionIndex: number, noteIndex: number, xlength: number){
        let ln = Math.floor(sectionIndex / this.sectionPerLine);
        // set note bar's position and bar tail's length
        e.lineGroup[0].x1 = x; e.lineGroup[0].y1 = 26 + y + this.stringPadding * 5; e.lineGroup[0].x2 = x; e.lineGroup[0].y2 = y;
        e.lineGroup[1].x1 = x; e.lineGroup[1].y1 = 25 + y + this.stringPadding * 5; e.lineGroup[1].x2 = x + tail[0]; e.lineGroup[1].y2 = 25 + y + this.stringPadding * 5;
        e.lineGroup[2].x1 = x; e.lineGroup[2].y1 = 21 + y + this.stringPadding * 5; e.lineGroup[2].x2 = x + tail[1]; e.lineGroup[2].y2 = 21 + y + this.stringPadding * 5;
        e.lineGroup[3].x1 = x; e.lineGroup[3].y1 = 17 + y + this.stringPadding * 5; e.lineGroup[3].x2 = x + tail[2]; e.lineGroup[3].y2 = 17 + y + this.stringPadding * 5;
        // set note word position
        for(let i = 0 ; i < 6; i++){
            e.blockGroup[i].x = x;
            e.blockGroup[i].y = y + this.stringPadding * i;
            e.blockGroup[i].extendRect.y =  y + this.stringPadding * (i - 0.5);
            e.blockGroup[i].extendRect.height = this.stringPadding;
            e.blockGroup[i].extendRect.width = xlength;
            utils.setAttributes(e.blockGroup[i].domelement,{"data-x": `${x}`, "data-y": `${y + this.stringPadding * i}`, "data-line": `${ln}`});
        }
        e.tail8.setPosition(x,y + this.stringPadding * 5 + 15);
        e.tail16.setPosition(x,y + this.stringPadding * 5 + 10);
        e.tail32.setPosition(x,y + this.stringPadding * 5 + 5);
        e.section = sectionIndex;
        e.note = noteIndex;
        e.line = ln;
        utils.setAttributes(e.domelement, {"data-section": `${sectionIndex}`, "data-note": `${noteIndex}`});
        e.blockGroup.forEach((wg, i) => {
            wg.section = sectionIndex;
            wg.note = noteIndex;
            wg.line = ln;
            utils.setAttributes(wg.domelement, {"data-section": `${sectionIndex}`, "data-note": `${noteIndex}`, "data-line": `${ln}`});
        });
    }
    private setChordVisiable(e:SVGNote, x: number, y: number, noteLength: number, data: number[], tail: number[], nextTail: number[]){
        let ap = true;
        e.tail8.hide();
        e.tail16.hide();
        e.tail32.hide();
        for(let i = 0 ; i < 3; i++){
            if(tail[i] < 0 || nextTail[i] < 0){
                ap = false;
                break;
            }
        }
        if(ap){
            if(noteLength == 8){
                e.tail8.show();
            }else if(noteLength == 16){
                e.tail16.show();
            }else if(noteLength == 32){
                e.tail32.show();
            }
            e.lineGroup[1].x2 = x;
            e.lineGroup[2].x2 = x;
            e.lineGroup[3].x2 = x;
        }
        for(let i = 0 ; i < 6; i++){
            e.blockGroup[i].word.text = `${data[i]}`;
            e.blockGroup[i].wordBack.text = `${data[i]}`;
            if(data[i] == -1){
                utils.setStyle(e.blockGroup[i].domelement, {display: "none"});
            }else{
                utils.setStyle(e.blockGroup[i].domelement, {display: "block"});
            }
        }
        if(noteLength == 2){
            e.lineGroup[0].y2 = 10 + y + this.stringPadding * 5;
            return;
        }else if(noteLength == 1){
            e.lineGroup[0].y2 = 26 + y + this.stringPadding * 5;
            return;
        }
        let hc: number = 6.5;
        // note bar should reach the top word
        for(let i = 1 ; i <= 6; i++){
            if(data[i-1] != -1){
                hc = i;
                break;
            }    
        }
        e.lineGroup[0].y2 = y + this.stringPadding * (hc - 1);
    }

    private setLinker(linkerData: number[][]){
        let lenumber = Math.floor(linkerData.length / 2);
        let existNumber = this.linkerElement.length
        for(let i = 0; i < lenumber - existNumber; i++){
            this.tabCanvas.layers.background.createLinker();
        }
        for(let i = 0; i < lenumber; i++){
            this.setLinkerData(this.tabCanvas.layers.background.linker[i], linkerData[i*2], linkerData[i*2+1]);
        }
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

    private onNoteClicked(ev: MouseEvent) {
        let section = Number((ev.currentTarget as SVGGElement).dataset.section);
        let note = Number((ev.currentTarget as SVGGElement).dataset.note);
        let string = Number((ev.currentTarget as SVGElement).dataset.string);
        let position = [Number((ev.currentTarget as SVGElement).dataset.x), Number((ev.currentTarget as SVGElement).dataset.y)]
        if(ev.shiftKey){
            this.callbacks["noteshiftclick"].callAll(section, note, string, position, ev.currentTarget);
        }
        else if(ev.altKey){
            this.callbacks["notealtclick"].callAll(section, note, string, position, ev.currentTarget);
        }
        else{
            this.callbacks["noteclick"].callAll(section, note, string, position, ev.currentTarget);
        }
    }
    private onKeydown(ev: KeyboardEvent){
        this.callbacks["keydown"].callAll(ev.key);
    }
    private onMouseOverNote(ev: MouseEvent){
        let section = Number((ev.currentTarget as SVGGElement).dataset.section);
        let note = Number((ev.currentTarget as SVGGElement).dataset.note);
        let string = Number((ev.currentTarget as SVGElement).dataset.string);
        let position = [Number((ev.currentTarget as SVGElement).dataset.x), Number((ev.currentTarget as SVGElement).dataset.y)]
        this.callbacks["mouseovernote"].callAll(section, note, string, position, ev.currentTarget);
    }
    private onMouseOutNote(ev: MouseEvent){
        let section = Number((ev.currentTarget as SVGGElement).dataset.section);
        let note = Number((ev.currentTarget as SVGGElement).dataset.note);
        let string = Number((ev.currentTarget as SVGElement).dataset.string);
        let position = [Number((ev.currentTarget as SVGElement).dataset.x), Number((ev.currentTarget as SVGElement).dataset.y)]
        this.callbacks["mouseoutnote"].callAll(section, note, string, position, ev.currentTarget);
    }
    private onMouseDown(ev: MouseEvent){
        this.callbacks["mousedown"].callAll(Number(ev.x), Number(ev.y));
    }
    private onMouseMove(ev: MouseEvent){
        this.callbacks["mousemove"].callAll(Number(ev.x), Number(ev.y));
    }
    private onMouseUp(ev: MouseEvent){
        this.callbacks["mouseup"].callAll(Number(ev.x), Number(ev.y));
    }
}
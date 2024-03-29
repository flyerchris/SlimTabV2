import { utils, Callbacks } from "./utils"
import { section, Note } from "./SlimTabV2Types"
import { Correction } from "./SlimTabV2Interface"
import { SLCanvas, SLLayer, SVGNote } from "./SlimTabV2Canvas"
import { SLInteracitive } from "./SlimTabV2Base"
import { CaculatedNoteData } from './SlimTabV2Interface'
interface eventCallBackInterface {
    noteclick: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    keydown: (key: string, keyCode: number) => any;
    mouseovernote: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    mouseoutnote: (section: number , note: number , string: number, position: number[], currentTarget: HTMLElement) => any;
    noteshiftclick: (section: number, note: number, string: number, position: number[], currentTarget: HTMLElement) => any;
    notealtclick: (section: number, note: number, string: number, position: number[], currentTarget: HTMLElement) => any;
    notectrlclcik: (section: number, note: number, string: number, position: number[], currentTarget: HTMLElement) => any;
    mousedown: (x: number, y: number) => any;
    mousemove: (x: number, y: number) => any;
    mouseup: (x: number, y: number) => any;
    sectionhover: (section: number) => any;
    sectionhout: (section: number) => any;
    sectionclick: (section: number, string: number) => any;
}
export class SLTab extends SLInteracitive {
    readonly lengthPerBeat: number = 4;
    readonly beatPerSection: number = 4;
    private calData: CaculatedNoteData[] = [];
    private callbacks: Callbacks;
    private sectionAddNoteNumber = 8;

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, lineWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        super();
        Object.assign(this, data);
        this.tabCanvas = new SLCanvas<SLLayer>(SLLayer);
        this.width = this.lineWidth + this.linePadding[0]*2 + 42*2;
        utils.setAttributes(this.tabCanvas.domElement,{width: `${this.width}`});
        this.domElement = document.createElement("div");
        this.domElement.append(this.tabCanvas.domElement);
        this.domElement.addEventListener("keydown",(e) => {
            let ka = [32, 37, 38, 39, 40]; //space: 32, left: 37, up: 38, right: 39, down: 40,
            if(ka.includes(e.keyCode)){
                e.preventDefault();
                e.returnValue = false;
            }
        });
        utils.setStyle(this.domElement, {"width": `${this.width + 20}px`, height: `${this.containerHeight}px`, "overflow-y": "auto", "overflow-x": "hidden"});
        //if add new event, you should describe the callback in eventCallBackInterface above
        this.callbacks = new Callbacks([
            "noteclick", 
            "noteshiftclick", 
            "notealtclick", 
            "notectrlclick",
            "keydown", 
            "mouseovernote", 
            "mouseoutnote", 
            "mousedown", 
            "mousemove", 
            "mouseup",
            "rightclick",
            "sectionhover",
            "sectionhout",
            "sectionclick",
        ]);
        
        utils.setAttributes(this.domElement, {tabindex: "-1"});
        this.domElement.addEventListener("keydown", this.onKeydown.bind(this));
        this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.domElement.addEventListener("contextmenu", this.onMouseRightClick.bind(this));//Right click
    }
    /**
     * add a note
     * @param { [number, number[], any] }   data, note length, [block number, index is string number,], user data
     * @param { number }                    section, if give -1, note will be appended at last section. Index start from 0
     * @param { number }                    note, if give -1, note will be appended at last note. Index start from 0
     */
    instrumentNoteInput(correction: Correction, data: Note, section: number = -1, note: number = -1) {
        if(section == -1)section = this.notes.length - 1;
        if(note == -1)note = this.notes[section].length;
        correction(this, data, section, note);
        this.render();
    }
    render() {
        this.setAllLine();
        let [calDataLength, changeSet, linkerData, sectionPosition, dotData] = this.calNoteData();
        this.setSectionIndicator(sectionPosition);
        this.setAllNoteElementData(calDataLength, changeSet);
        this.setLinker(linkerData);
        this.setDot(dotData);
        let ln = Math.ceil(this.notes.length / this.sectionPerLine);
        if(this.height != (this.lineStartPosition[1] + (this.stringPadding * 5 + this.lineDistance) * ln + 70)){
            this.height = (this.lineStartPosition[1] + (this.stringPadding * 5 + this.lineDistance) * ln + 70);
            utils.setAttributes(this.tabCanvas.domElement,{ height: `${this.height}`});
        }
    }

    on<k extends keyof eventCallBackInterface>(ename: k, cbk: eventCallBackInterface[k]) {
        if(ename in this.callbacks) {
            this.callbacks[ename].push(cbk);
        }
    }
    
    isSectionFull(section: number){
        let stackLength = 0;// unit in beat
        for(let i = 0; i < this.notes[section].length; i++){
            stackLength += this.lengthPerBeat / this.notes[section][i][0];
        }
        if(stackLength >= this.beatPerSection){
            return true;
        }
        return false;
    }

    deleteNote(section: number, note: number, number: number = 1): Note[]{
        let np = this.getNoteFlattenNumber(section, note);
        let dn = this.notes[section].splice(note, number);
        this.removeCalData(np, dn.length);
        return dn;
    }

    deleteSections(section: number, number: number = 1): section[]{
        if(section < 0 || section >= this.notes.length){
            return [];
        }
        let dn = 0;
        let dp = this.getNoteFlattenNumber(section, 0);
        for(let i = section; i < section + number && i < this.notes.length; i++) dn += this.notes[i].length;
        this.removeCalData(dp, dn);
        return this.notes.splice(section, number);
    }

    insertSection(section: number, data: section = []): boolean{
        if(section < 0 || section > this.notes.length){
            return false;
        }
        let isp = this.getNoteFlattenNumber(section, this.getNoteNumberOfSection(section) - 1);
        let isa: CaculatedNoteData[] = [];
        for(let i = 0; i < data.length; i++){
            isa.push({x: -1, y: -1, length: -1, blocks: [], tail: [], section: -1, note: -1, hasSvg: false});
        }
        this.notes.splice(section, 0, data);
        this.calData.splice(isp + 1, 0, ...isa);
        return true;
    }

    clearData(){
        super.clearData();
        this.calData = [];
    }

    addNote(section: number, note: number, data: Note): [number, number]{
        [section, note] = super.addNote(section, note, data);
        if(section != -1){
            let np = this.getNoteFlattenNumber(section, note);
            this.calData.splice(np, 0, {x: -1, y: -1, length: -1, blocks: [], tail: [], section: -1, note: -1, hasSvg: false});
        }
        return [section, note];
    }

    private removeCalData(removeIndex: number, num: number){
        this.calData.splice(removeIndex, num);
        this.tabCanvas.layers.notes.removeNote(removeIndex, num);
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
        if(position.length > this.tabCanvas.layers.ui.sectionIndicator.length){
            let nsNumber = position.length - this.tabCanvas.layers.ui.sectionIndicator.length;
            for(let i = 0; i < nsNumber; i++){
                let nc = this.tabCanvas.layers.ui.createSectionIndicator();
                nc.on("mousemove",this.onSectionHover.bind(this));
                nc.on("mouseout",this.onSectionHout.bind(this));
                nc.on("click",this.onSectionClick.bind(this));
            }
        }
        for(let i = 0; i < position.length; i++){
            let width = position[i][1][0] - position[i][0][0];
            let height = this.stringPadding * 5;
            this.tabCanvas.layers.ui.sectionIndicator[i].x = position[i][0][0]
            this.tabCanvas.layers.ui.sectionIndicator[i].y = position[i][0][1]
            this.tabCanvas.layers.ui.sectionIndicator[i].width = width;
            this.tabCanvas.layers.ui.sectionIndicator[i].height = height;
            this.tabCanvas.layers.sheet.bar[i].x1 = position[i][0][0] + width;
            this.tabCanvas.layers.sheet.bar[i].x2 = position[i][0][0] + width;
            utils.setAttributes(this.tabCanvas.layers.ui.sectionIndicator[i].domElement,{"data-section": `${i}`});
            utils.setStyle(this.tabCanvas.layers.ui.sectionIndicator[i].domElement, {display: "unset"});
            utils.setStyle(this.tabCanvas.layers.sheet.bar[i].domElement, {display: "unset"});
        }
        for(let i = position.length; i < this.tabCanvas.layers.ui.sectionIndicator.length; i++){
            utils.setStyle(this.tabCanvas.layers.ui.sectionIndicator[i].domElement, {display: "none"});
            utils.setStyle(this.tabCanvas.layers.sheet.bar[i].domElement, {display: "none"});
        }
    }

    private calNoteData():[number, Set<number>, number[][], [number[], number[]][], number[][] ]{
        let [x, y] = this.startPosition;
        let sectionLength = this.beatPerSection / this.lengthPerBeat;
        let linker = [];
        let dot = [];
        let sectionIndicator: [number[], number[]][] = [];
        let seperaterLength = 1 / 4;
        let accumulatedLength = 0;
        let ci = 0;
        let changeSet = new Set<number>();
        let first = -1;

        for(let s = 0; s < this.notes.length; s++){ // section
            let line = Math.floor(s / this.sectionPerLine);
            let lineTotalNote = 0;
            accumulatedLength = 0;
            for(let i = 0; i < this.sectionPerLine; i++){
                if(this.notes[line * this.sectionPerLine + i]){
                    lineTotalNote += Math.max(this.notes[line * this.sectionPerLine + i].length, this.sectionAddNoteNumber);
                }else{
                    lineTotalNote += this.sectionAddNoteNumber;
                }
            }
            let sectionWidth = this.lineWidth * (Math.max(this.notes[s].length, this.sectionAddNoteNumber)) / lineTotalNote;
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
            sectionIndicator.push(sx);
            for(let i = 0; i < this.notes[s].length; i++){ // note
                let note = this.notes[s][i];
                let noteLength = this.lengthPerBeat / note[0];
                let tail: number[];
                if(accumulatedLength + noteLength / this.lengthPerBeat >= seperaterLength){ // the note is the end of a beat or the note's length equals to a beat
                    let cdataLLength = 0;
                    if(ci > 0) cdataLLength = this.calData[ci - 1].length;
                    tail = this.calculateTail(cdataLLength, note[0], -1, beatLength);
                    accumulatedLength = 0;
                }else{
                    let cdataLLength = 0;
                    if(ci > 0) cdataLLength = this.calData[ci - 1].length;
                    tail = this.calculateTail(cdataLLength, note[0], accumulatedLength, beatLength);
                    accumulatedLength += noteLength / this.lengthPerBeat;
                }
                let step = beatLength * this.lengthPerBeat / note[0];
                let updateNote = this.updatecalData(ci, x, y, note[0], note[1], tail, s, i);
                if(updateNote>=0)changeSet.add(updateNote).add(updateNote - 1);
                ci++;
                let userDataArray = [];
                if(note[2]) userDataArray = note[2].split(" ");
                if(userDataArray.includes("linkEnd")) linker.push([x,y]);
                if(userDataArray.includes("linkStart")) linker.push([x,y]);

                if(note[0] !== Math.floor(note[0])){
                    //console.log(note[0]);
                    dot.push([x, y]);
                }
                x += step;
            }
            x = nx;
        }
        changeSet.delete(-1);
        return [ci, changeSet, linker, sectionIndicator, dot];// ci = totoal section number, changeSet = store index of change data
    }

    private updatecalData(arryIndex: number, x: number, y: number, noteLength: number, noteData: number[], tail: number[], section: number, note: number): number{
        if(arryIndex > this.calData.length){
            console.error("array index erro, should not be greater than calData.length");
            return -1;
        }
        if(arryIndex === this.calData.length){
            this.calData.push({x: x, y: y, length: noteLength, blocks: noteData.slice(0, 6), tail: tail.slice(0, tail.length), section: section, note: note, hasSvg: false});
            return arryIndex;
        }
        let data = this.calData[arryIndex];
        if(data.x != x || data.y != y || data.length != noteLength || data.section != section || data.note != note || !this.compareArray(data.blocks, noteData) || !this.compareArray(data.tail, tail)){ 
            this.calData[arryIndex].x = x;
            this.calData[arryIndex].y = y;
            this.calData[arryIndex].length = noteLength;
            this.calData[arryIndex].blocks = noteData.slice(0, 6);
            this.calData[arryIndex].tail = tail.slice(0, tail.length);
            this.calData[arryIndex].section = section;
            this.calData[arryIndex].note = note;
            return arryIndex;
        }
        
        return -1;
    }

    private compareArray(a: number[], b: number[]){
        if(a.length != b.length) return false;
        for(let i = 0; i < a.length; i++){
            if(a[i] != b[i]) return false;
        }
        return true;
    }

    private calculateTail(lastNoteLength: number, noteLength: number, accumulatedLength: number, beatLength: number): number[]{
        let step = beatLength * this.lengthPerBeat / lastNoteLength * -1;
        let basicLength = 8;
        if(accumulatedLength == -1)basicLength = -8;
        if(accumulatedLength == 0){ // start of a seperate note
            if(noteLength <= 4){

            }else if(noteLength <= 8){
                return [basicLength, 0, 0];
            }else if(noteLength <= 16){
                return [basicLength, basicLength, 0];
            }else if(noteLength <= 32){
                return [basicLength, basicLength, basicLength];
            }
        }else{
            if(noteLength <= 4){

            }else if(noteLength <= 8){
                if(lastNoteLength >= 8){
                    return [step, 0, 0];
                }
            }else if(noteLength <= 16){
                if(lastNoteLength <= 4){

                }else if(lastNoteLength <= 8 ){
                    return [step, basicLength, 0];
                }else if(lastNoteLength <= 32){
                    return [step, step, 0];
                }
            }else if(noteLength <= 32){
                if(lastNoteLength <= 4){

                }else if(lastNoteLength <= 8){
                    return [step, basicLength, basicLength];
                }else if(lastNoteLength <= 16){
                    return [step, step, basicLength];
                }else if(lastNoteLength <= 32){
                    return [step, step, step];
                }
            }
        }
        return [0, 0, 0];
    }
    /**
     * receive data from calNoteData and set elements
     * @param { [number, number, number, number[]][] } data 
     */
    private setAllNoteElementData(dataLength: number, changeSet: Set<number>){
        let data = this.calData;
        let noteElement = this.tabCanvas.layers.notes.noteElements
        let ne = dataLength - noteElement.length;
        let nullData: CaculatedNoteData = {x: 0, y: 0, length: 0, blocks: [-1, -1, -1, -1, -1, -1], tail: [0, 0, 0], section: 0, note: 0, hasSvg: null}//[0, 0, 0, [-1, -1, -1, -1, -1, -1], [0, 0, 0], 0, 0];
        for(let i = 0; i < this.calData.length; i++){
            if(!this.calData[i].hasSvg){
                this.tabCanvas.layers.notes.createNote(i);
                this.calData[i].hasSvg = true;
                noteElement[i].blockGroup.forEach((wg, i) => {
                    wg.on("click", this.onNoteClicked.bind(this));
                    wg.on("mouseover", this.onMouseOverNote.bind(this));
                    wg.on("mouseout", this.onMouseOutNote.bind(this));
                    wg.string = i;
                    utils.setAttributes(wg.domElement, {"data-string": `${i}`});
                });
            }
        }
        changeSet.forEach((si, i)=>{
            if(i != data.length - 1){
                if(data[i+1].x > data[i].x){
                    this.setNoteElementData(noteElement[i], data[i], data[i + 1], (data[i+1].x - data[i].x) * 0.7);
                }else{
                    this.setNoteElementData(noteElement[i], data[i], data[i + 1], 30);
                }
            }else{
                this.setNoteElementData(noteElement[i], data[i], nullData, 30);
            }
        });
    }
    private setNoteElementData(el: SVGNote, data: CaculatedNoteData, nexData: CaculatedNoteData ,xlength: number){
        this.setElementPosition(el, data.x, data.y, data.tail, data.section, data.note, xlength);
        this.setChordVisiable(el, data.x, data.y, data.length, data.blocks, data.tail, nexData.tail);
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
            utils.setAttributes(e.blockGroup[i].domElement,{"data-x": `${x}`, "data-y": `${y + this.stringPadding * i}`, "data-line": `${ln}`});
        }
        e.tail8.setPosition(x + 0.4,y + this.stringPadding * 5 + 14);
        e.tail16.setPosition(x + 0.4,y + this.stringPadding * 5 + 10);
        e.tail32.setPosition(x + 0.4,y + this.stringPadding * 5 + 6);
        e.section = sectionIndex;
        e.note = noteIndex;
        e.line = ln;
        utils.setAttributes(e.domElement, {"data-section": `${sectionIndex}`, "data-note": `${noteIndex}`});
        e.blockGroup.forEach((wg, i) => {
            wg.section = sectionIndex;
            wg.note = noteIndex;
            wg.line = ln;
            utils.setAttributes(wg.domElement, {"data-section": `${sectionIndex}`, "data-note": `${noteIndex}`, "data-line": `${ln}`});
        });
    }
    private setChordVisiable(e:SVGNote, x: number, y: number, noteLength: number, data: number[], tail: number[], nextTail: number[]){
        let ap = true;
        let hc: number = -1; // top chord which data is not -1
        for(let i = 0 ; i < 6; i++){
            if(data[i] != -1){
                hc = i;
                break;
            }    
        }
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
            if(hc != -1){
                if(noteLength <=4){

                }else if(noteLength <= 8){
                    e.tail8.show();
                }else if(noteLength <= 16){
                    e.tail16.show();
                }else if(noteLength <= 32){
                    e.tail32.show();
                }
            }
            e.lineGroup[1].x2 = x;
            e.lineGroup[2].x2 = x;
            e.lineGroup[3].x2 = x;
        }
        for(let i = 0 ; i < 6; i++){
            if(data[i] == -1){
                e.blockGroup[i].word.text = ``;
                e.blockGroup[i].wordBack.text = ``;
            }else{
                e.blockGroup[i].word.text = `${data[i]}`;
                e.blockGroup[i].wordBack.text = `${data[i]}`;
            }
        }
        if(noteLength == 2){
            e.lineGroup[0].y2 = 10 + y + this.stringPadding * 5;
            return;
        }else if(noteLength == 1){
            e.lineGroup[0].y2 = 26 + y + this.stringPadding * 5;
            return;
        }
        
        // note bar should reach the top word
        if(hc === -1){
            e.lineGroup[0].y2 = y + this.stringPadding * 5 + 26 ;
        }else{
            e.lineGroup[0].y2 = y + this.stringPadding * hc;
        }
    }

    private setLinker(linkerData: number[][]){
        let lenumber = Math.floor(linkerData.length / 2);
        let existNumber = this.tabCanvas.layers.background.linker.length;
        for(let i = 0; i < lenumber - existNumber; i++){
            this.tabCanvas.layers.background.createLinker();
        }
        for(let i = 0; i < lenumber; i++){
            utils.setStyle(this.tabCanvas.layers.background.linker[i], {display: "unset"});
            this.setLinkerData(this.tabCanvas.layers.background.linker[i], linkerData[i*2], linkerData[i*2+1]);
        }
        for(let i = lenumber; i < this.tabCanvas.layers.background.linker.length; i++){
            utils.setStyle(this.tabCanvas.layers.background.linker[i], {display: "none"});
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
    private setDot(dotData: number[][]){
        let lenumber = dotData.length;
        let existNumber = this.tabCanvas.layers.notes.dot.length;
        for(let i = 0; i < lenumber - existNumber; i++){
            let ndt = this.tabCanvas.layers.notes.createEllipse(0, 0, 2.5, 2.5);
            ndt.fill = "white";
            this.tabCanvas.layers.notes.dot.push(ndt);
        }
        for(let i = 0; i < lenumber; i++){
            utils.setStyle(this.tabCanvas.layers.notes.dot[i].domElement, {display: "unset"});
            this.tabCanvas.layers.notes.dot[i].cx = dotData[i][0] + 12;
            this.tabCanvas.layers.notes.dot[i].cy = dotData[i][1] + 12 + this.stringPadding * 5;
        }
        for(let i = lenumber; i < this.tabCanvas.layers.notes.dot.length; i++){
            utils.setStyle(this.tabCanvas.layers.notes.dot[i].domElement, {display: "none"});
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
        else if(ev.ctrlKey){
            this.callbacks["notectrlclick"].callAll(section, note, string, position, ev.currentTarget);
        }
        else{
            this.callbacks["noteclick"].callAll(section, note, string, position, ev.currentTarget);
        }
    }
    private onKeydown(ev: KeyboardEvent){
        this.callbacks["keydown"].callAll(ev.key, ev.keyCode);
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
    private onMouseRightClick(ev: MouseEvent){
        this.callbacks["rightclick"].callAll(Number(ev.x), Number(ev.y));
    }
    private onSectionHover(ev: MouseEvent){
        this.callbacks["sectionhover"].callAll(Number((ev.currentTarget as SVGElement).dataset.section));
    }
    private onSectionHout(ev: MouseEvent){
        this.callbacks["sectionhout"].callAll(Number((ev.currentTarget as SVGElement).dataset.section));
    }
    private onSectionClick(ev: MouseEvent){
        let offsetY = ev.clientY - this.domElement.getBoundingClientRect().top + this.domElement.scrollTop;
        let y = Number((<SVGElement>ev.currentTarget).getAttribute("y"));
        let string = Math.floor((offsetY - y)/this.stringPadding);
        this.callbacks["sectionclick"].callAll(Number((ev.currentTarget as SVGElement).dataset.section), string);
    }
}
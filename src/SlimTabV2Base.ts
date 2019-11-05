import { SLCanvas, SLLayer } from "./SlimTabV2Canvas"
import { utils } from "./utils"
import { section, Note } from "./SlimTabV2Types"
import { SVGNote } from "./SlimTabV2Canvas"

export class SLBase{
    notes: section[];
    //todo: do a stricter check for these function
    setData(data: [number, number[], any][][]) {
        this.clearData();
        let na: Note[][] = [];
        for(let i = 0; i < data.length; i++){
            let newSection: Note[] = [];
            for(let j = 0; j < data[i].length; j++){
                let newNote = new Note({noteValue: data[i][j][0], stringContent: data[i][j][1], userData: data[i][j][2]});
                newSection.push(newNote);
            }
            na.push(newSection);
        }
        this.notes = na;
    }

    getNoteData(section: number, note: number): Note{
        return this.notes[section][note];
    }
    
    setNoteData(section: number, note: number, data: Note){
        // if(section === -1)section = this.notes.length - 1;
        // if(note === -1)note = this.notes[section].length - 1;
        this.notes[section][note] = data;
    }

    setStringDataOfNote(section: number, note: number, string: number, data: number){
        if(string >=0 && string <= 5){
            this.notes[section][note][1][string] = data;
        }
    }

    getSectionData(section: number): Note[]{
        return this.notes[section];
    }

    deleteNote(section: number, note: number, number: number = 1): Note[]{
        // if(section === -1)section = this.notes.length - 1;
        // if(note === -1)note = this.notes[section].length - 1;
        return this.notes[section].splice(note, number);
    }

    addNote(section: number, note: number, data: Note): [number, number]{
        if(section === -1 || section >= this.notes.length){
            section = this.notes.length;
            this.notes.push([]);
        }
        if(note === -1 || note > this.notes[section].length){
            note = this.notes[section].length;
        }
        this.notes[section].splice(note, 0, data);
        return [section, note];
    }

    isBlankNote(section: number, note: number){
        for(let i = 0; i < 6; i++){
            if(this.notes[section][note][1][i] != -1){
                return false;
            }
        }
        return true;
    }

    getNoteNumberOfSection(section: number){
        if(!this.notes[section])return -1;
        return this.notes[section].length;
    }

    getSectionNumber(){
        return this.notes.length;
    }

    insertSection(section: number, data: section = []): boolean{
        if(section < 0 || section > this.notes.length){
            return false;
        }
        // if(section === -1)section = this.notes.length;
        this.notes.splice(section, 0, data);
        return true;
    }

    deleteSections(section: number, number: number = 1): section[]{
        if(section < -1 || section >= this.notes.length){
            return [];
        }
        return this.notes.splice(section, number);
    }

    getNoteFlattenNumber(section: number, note: number): number{
        if(!this.notes[section]) return -1;
        // if(note === -1) note = this.notes[section].length - 1;
        if(this.notes[section][note]){
            let total = 0;
            for(let i = 0; i < section; i++) total += this.notes[i].length;
            total += note;
            return total;
        }
        return -1;
    }

    clearData(){
        this.notes = [[]];
    }

}

export class SLView extends SLBase{
    tabCanvas: SLCanvas<SLLayer>;
    domElement: HTMLElement;
    readonly containerHeight: number = 700;
    protected lineWidth: number = 1200;
    protected sectionPerLine: number = 4;
    protected stringPadding: number = 16; // distance between each string
    protected linePerPage: number = 20;
    protected lineMargin: number = 42; // only for left and right
    protected linePadding: [number, number] = [32, 14];
    protected lineDistance: number = 90; // distance between each line
    protected startPosition: number[] = [this.lineMargin + this.linePadding[0] + 20, 120 + this.linePadding[1]]; // x, y
    protected lineStartPosition: [number, number] = [this.lineMargin, 120]; // total line number, last line X, last line Y
    protected height: number;
    protected width: number;

    getSectionLeftTopPos(section: number): [number, number]{
        if(section < this.notes.length){
            return [this.tabCanvas.layers.ui.sectionIndicator[section].x, this.tabCanvas.layers.ui.sectionIndicator[section].y];
        }
        return [-1, -1]
    }

    getSectionWidth(section: number): number{
        if(section < this.notes.length){
            this.tabCanvas.layers.ui.sectionIndicator[section].width;
        }
        return 0;
    }

    getSectionHeight(section: number): number{
        if(section < this.notes.length){
            this.tabCanvas.layers.ui.sectionIndicator[section].height;
        }
        return 0;
    }

    attach(anchor: HTMLElement){
        anchor.append(this.domElement);
        utils.setStyle(anchor, {width: `${this.width + 20}px`});// add 20 for scroll bar
    }

    noteIndex(note: SVGNote){
        return this.tabCanvas.layers.notes.noteElements.indexOf(note);
    }

    getSVGNote(section: number, note: number): SVGNote{
        let noteElements = this.tabCanvas.layers.notes.noteElements;
        return noteElements.find((elem) => {
            return elem.section == section && elem.note == note
        })
    }

    getNotePosition(section: number, note: number, string: number = 0): [number, number]{
        let sum = 0;
        if(section >= this.notes.length || section < 0 || note >= this.notes[section].length || note < 0 || string > 5 || string < 0){
            return [-1, -1];
        }
        if(this.notes[section].length === 0 ) return [-1, -1];
        for(let i = 0; i < section; i++){
            sum += this.notes[i].length;
        }
        sum += note;
        if(!this.tabCanvas.layers.notes.noteElements[sum]) return [-1, -1];
        let sel = this.tabCanvas.layers.notes.noteElements[sum].blockGroup[string];
        return [sel.x, sel.y];
    }

    clearData(){
        super.clearData();
        this.tabCanvas.layers.notes.removeNote(0, this.tabCanvas.layers.notes.noteElements.length);
    }

}

export class SLInteracitive extends SLView{
    inEdit: boolean = true;
    scrollTo(val: number){
        this.domElement.scrollTop = val;
    }

    adjustPostion(y: number){
        if(y + 220 > this.domElement.scrollTop + this.containerHeight){
            this.scrollTo(y - this.containerHeight + 220);
        }
        if(y - 80 < this.domElement.scrollTop){
            this.scrollTo(y - 80);
        }
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
                    && noteElements[i].blockGroup[j].y <=y2 
                    && noteElements[i].domElement.style.display != "none"){
                    selectedNoteIds.push(i);
                }
            }
        }
        leftSelectedNote = Math.min(...selectedNoteIds);
        rightSelectedNote = Math.max(...selectedNoteIds);
        return noteElements.slice(leftSelectedNote, rightSelectedNote+1);
    }

    endsSelect(head: number, tail: number): SVGNote[]{
        if(head > tail){
            let temp = tail;
            tail = head;
            head = temp;
        }
        return this.tabCanvas.layers.notes.noteElements.slice(head, tail+1);
    }

    headToEndSelect(head: number): SVGNote[]{
        return this.tabCanvas.layers.notes.noteElements.slice(head, this.tabCanvas.layers.notes.noteElements.length);
    }
    
    addNote(section: number, note: number, data: Note): [number, number]{
        if(this.inEdit){
            return super.addNote(section, note, data);
        }
        return [-1, -1];
    }
}
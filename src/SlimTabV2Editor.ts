import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { utils } from "./utils";
import { Rect, Ellipse, Text, Line, SVGNote, NoteBlock} from "./SlimTabV2Canvas"

interface NoteBlockIndex{
    section: number;
    note: number;
    string: number;
    data: note;
}

export class SLEditor {
    private selectedBlock: NoteBlockIndex;
    private selectedSVGNote: SVGNote;
    private controlTab: SLTab;
    private indicator: Ellipse;
    private shadowIndicator: Ellipse;
    private inputBlock: number = 0;
    private dragNDropSection: Rect;
    private dragStartPos: number[];
    private selectedSVGNotes: SVGNote[];
    private mouseDown: boolean = false;
    private mouseMove: boolean = false;
    private selectNotesIndicator: Rect[] = [];
    private selectNotesIndicatorPadding: number = 8;

    constructor(controlTab: SLTab){
        this.controlTab = controlTab;
        this.indicator = this.controlTab.tabCanvas.layers.ui.createEllipse(0, 0 , 8, 8);
        this.shadowIndicator = this.controlTab.tabCanvas.layers.ui.createEllipse(0, 0 , 8, 8);
        this.indicator.cx = -20;
        this.indicator.cy = -20;
        this.indicator.fill = "rgb(255, 50, 0)"
        this.shadowIndicator.cx = -20;
        this.shadowIndicator.cy = -20;
        this.shadowIndicator.fill = "rgba(255, 50, 0, 0.6)";
        this.dragNDropSection = this.controlTab.tabCanvas.layers.ui.createRect(0, 0, 0, 0, 0, "rgba(255, 50, 0, 0.6)");
        this.setEvents();
    }
    private setEvents(){
        this.controlTab.on("noteclick", (section, note, string, position) => {
            this.setNoteClickEvent(section, note, string, position);
            this.selectedSVGNote = this.controlTab.getSVGNote(section, note);
            this.unselectSVGNotes();
        });
        this.controlTab.on("noteshiftclick", (section, note, string, position) => {
            this.unselectSVGNotes();
            this.controlTab.getSVGNote(section, note)
            this.selectedSVGNotes = this.controlTab.endsSelect(this.controlTab.noteIndex(this.selectedSVGNote), this.controlTab.noteIndex(this.controlTab.getSVGNote(section, note)))
            this.drawMultiSelectRect(this.selectedSVGNotes);
        });
        this.controlTab.on("keydown", (key) => {
            if((<string>key).toLowerCase() !== " " && !isNaN(Number(key))){
                if(this.selectedBlock){
                    let tb = this.inputBlock * 10 + Number(key)
                    if(tb < 40){
                        this.inputBlock = tb;
                    }else{
                        this.inputBlock = Number(key);
                    }
                    this.selectedBlock.data[1][this.selectedBlock.string] = this.inputBlock;
                    // in fact you don't need to do this, but I wish to update date through api, rather change it directly.
                    this.controlTab.setNoteData(this.selectedBlock.section, this.selectedBlock.note, this.selectedBlock.data);
                    this.controlTab.render();
                }
            }else{
                this.inputBlock = 0;
            }
            if((<string>key).toLowerCase() === "d" || (<string>key).toLowerCase() === "arrowright"){
                if(this.selectedSVGNotes.length > 0){
                    let rightSideBlock = this.selectedSVGNotes[this.selectedSVGNotes.length-1].blockGroup[0]
                    this.selectedBlock = {section: rightSideBlock.section, note:rightSideBlock.note, string: rightSideBlock.string, data: this.controlTab.getNoteData(rightSideBlock.section, rightSideBlock.note)}
                    this.unselectSVGNotes();
                }
                if(this.selectedBlock){
                    this.selectRight(this.selectedBlock, this.controlTab);
                }
            }
            if((<string>key).toLowerCase() === "a" || (<string>key).toLowerCase() === "arrowleft"){
                if(this.selectedSVGNotes.length > 0){
                    let leftSideBlock = this.selectedSVGNotes[0].blockGroup[0]
                    this.selectedBlock = {section: leftSideBlock.section, note:leftSideBlock.note, string: leftSideBlock.string, data: this.controlTab.getNoteData(leftSideBlock.section, leftSideBlock.note)}
                    this.unselectSVGNotes();
                }
                if(this.selectedBlock){
                    this.selectLeft(this.selectedBlock, this.controlTab);
                }
            }
            if((<string>key).toLowerCase() === "w" || (<string>key).toLowerCase() === "arrowup"){
                if(this.selectedSVGNotes.length > 0){
                    let rightSideBlock = this.selectedSVGNotes[this.selectedSVGNotes.length-1].blockGroup[0]
                    this.selectedBlock = {section: rightSideBlock.section, note:rightSideBlock.note, string: rightSideBlock.string, data: this.controlTab.getNoteData(rightSideBlock.section, rightSideBlock.note)}
                    this.unselectSVGNotes();
                }
                if(this.selectedBlock){
                    this.selectUp(this.selectedBlock, this.controlTab);
                }
            }
            if((<string>key).toLowerCase() === "s" || (<string>key).toLowerCase() === "arrowdown"){
                if(this.selectedSVGNotes.length > 0){
                    let rightSideBlock = this.selectedSVGNotes[this.selectedSVGNotes.length-1].blockGroup[0]
                    this.selectedBlock = {section: rightSideBlock.section, note:rightSideBlock.note, string: rightSideBlock.string, data: this.controlTab.getNoteData(rightSideBlock.section, rightSideBlock.note)}
                    this.unselectSVGNotes();
                }
                if(this.selectedBlock){
                    this.selectDown(this.selectedBlock, this.controlTab);
                }
            }
            if((<string>key).toLowerCase() === "delete" || (<string>key).toLowerCase() === "backspace"){
                if(this.selectedSVGNotes.length > 0){
                    for(let i = this.selectedSVGNotes.length -1; i >= 0; i--){
                        console.log("delete " + this.selectedSVGNotes[i].section + " " + this.selectedSVGNotes[i].note)
                        this.controlTab.deleteNote(this.selectedSVGNotes[i].section, this.selectedSVGNotes[i].note);
                        this.controlTab.render();
                    }
                    this.unselectSVGNotes();
                }
                else if(this.selectedBlock){
                    this.deleteNoteBlock(this.selectedBlock, this.controlTab);
                }
            }
            if((<string>key).toLowerCase() === "+"){
                this.changeNoteLength("+");
            }
            if((<string>key).toLowerCase() === "-"){
                this.changeNoteLength("-");
            }
        });
        this.controlTab.on("mouseovernote", (section, note, string, position) => {
            this.shadowIndicator.cx = position[0];
            this.shadowIndicator.cy = position[1];
        });
        this.controlTab.on("mouseoutnote", (section, note, string, position) => {
            this.shadowIndicator.cx = -20;
            this.shadowIndicator.cy = -20;
        });
        this.controlTab.on("mousedown", (x, y) => {
            y += this.controlTab.domElement.scrollTop;
            if(this.dragNDropSection != null){
                this.dragNDropSection.remove();
            }
            this.dragNDropSection = this.controlTab.tabCanvas.layers.ui.createRect(0, 0, 0, 0, 5, "rgba(255, 50, 0, 0.6)");
            this.dragStartPos = [x, y];
            this.dragNDropSection.style = {display: "none"};
            this.mouseDown = true;
            this.mouseMove = false;
            this.unselectSVGNotes();
        });
        //Mouse move event, handle with all quadrant of direction.
        this.controlTab.on("mousemove", (x, y) => {
            y += this.controlTab.domElement.scrollTop;
            if (this.mouseDown) {
                if(Math.sqrt(Math.pow(x - this.dragStartPos[0], 2) + Math.pow(y - this.dragStartPos[1], 2)) > 2){
                    this.mouseMove = true;
                } 

                if(this.mouseMove){
                    if(x - this.dragStartPos[0] >= 0){
                        this.dragNDropSection.x = this.dragStartPos[0];
                    }
                    else{
                        this.dragNDropSection.x = x;
                    }
                    if(y - this.dragStartPos[1] >= 0){
                        this.dragNDropSection.y = this.dragStartPos[1];
                    }
                    else{
                        this.dragNDropSection.y = y;
                    }
                    this.dragNDropSection.setShape(Math.abs(x - this.dragStartPos[0]), Math.abs(y - this.dragStartPos[1]));
                    this.dragNDropSection.style = {display: "unset"};
                }
            }
        });
        this.controlTab.on("mouseup", (x, y) =>{
            y += this.controlTab.domElement.scrollTop;
            this.mouseDown = false;
            if(this.mouseMove){
                let x1: number;
                let y1: number;
                let x2: number;
                let y2: number;
                this.dragNDropSection.remove();
                if (x >= this.dragStartPos[0]){
                    x1 = this.dragStartPos[0];
                    x2 = x;
                }
                else{
                    x1 = x;
                    x2 = this.dragStartPos[0];
                }
                if(y >= this.dragStartPos[1]){
                    y1 = this.dragStartPos[1];
                    y2 = y;
                }
                else{
                    y1 = y;
                    y2 = this.dragStartPos[1];
                }
                this.selectedSVGNotes = this.controlTab.areaSelect(x1, y1, x2, y2);
                this.drawMultiSelectRect(this.selectedSVGNotes);
            }
        });
    }
    private selectNoteAndMoveIndicator(section: number, note: number, string: number): boolean{
        let np = this.controlTab.getNotePosition(section, note, string);
        if(np[0] === -1)return false;
        this.setSelectNote(section, note, string);
        this.setIndicator(np);
        return true;
    }
    private setNoteClickEvent(section: number, note: number, string: number, position: number[]){
        this.setSelectNote(section, note, string);
        this.setIndicator(position);
    }
    private setSelectNote(section: number, note: number, string: number){
        this.selectedBlock = {section: section, note: note, string: string, data: this.controlTab.getNoteData(section, note)};
    }
    private setIndicator(position: number[]){
        this.indicator.cx = position[0];
        this.indicator.cy = position[1];
        if(position[0] > 0)this.controlTab.scrollTo(position[1] - 166);
    }
    private changeNoteLength(operater: string){
        let factor: number;
        if(operater === "+"){
            factor = 1;
        }else if(operater === "-"){
            factor = 0;
        }else{
            return;
        }
        if(this.selectedBlock){
            let lengthArray = [1, 2, 4, 8, 16, 32];
            for(let i = 1 - factor ; i < lengthArray.length - factor; i++){
                if(lengthArray[i] === this.selectedBlock.data[0]){
                    this.selectedBlock.data[0] = lengthArray[i - 1 + factor * 2];
                    console.log(this.selectedBlock.data[0], i - 1 + factor * 2);
                    this.controlTab.setNoteData(this.selectedBlock.section, this.selectedBlock.note, this.selectedBlock.data);
                    this.controlTab.render();
                    this.selectNoteAndMoveIndicator(this.selectedBlock.section, this.selectedBlock.note, this.selectedBlock.string);
                    break;
                }
            }
        }
    }
    private selectRight(selectNote: NoteBlockIndex, controlTab: SLTab){
        let s = this.selectNoteAndMoveIndicator(selectNote.section, selectNote.note + 1, selectNote.string);
        if(!s){ // the current selection is the last note of the section
            if(controlTab.isBlankNote(selectNote.section, selectNote.note)){
                // delete the blank note and move to next section in the second time pressing "right" key
                let pl = controlTab.getNoteNumberOfSection(selectNote.section);
                if(pl != 1){
                    controlTab.deleteNote(selectNote.section , selectNote.note);
                    controlTab.render();
                }
                s = this.selectNoteAndMoveIndicator(selectNote.section + 1, 0, selectNote.string);
                if(!s){ // the current selection is the last section and the last note
                    controlTab.addNote(selectNote.section + 1, 0, [4, [-1, -1, -1, -1, -1,-1], null]);
                    controlTab.render();
                    this.selectNoteAndMoveIndicator(selectNote.section + 1, 0, selectNote.string);
                }
            }else{
                controlTab.addNote(selectNote.section, selectNote.note + 1, [4, [-1, -1, -1, -1, -1,-1], null]);
                controlTab.render();
                this.selectNoteAndMoveIndicator(selectNote.section, selectNote.note + 1, selectNote.string);
            }
        }else{
            if(selectNote.note - 1 >= 0){
                if(controlTab.isBlankNote(selectNote.section, selectNote.note - 1)){
                    controlTab.deleteNote(selectNote.section, selectNote.note - 1);
                    controlTab.render();
                    this.selectNoteAndMoveIndicator(selectNote.section , selectNote.note - 1, selectNote.string);
                }
            }
        }
    }
    private selectLeft(selectNoteBlock: NoteBlockIndex, controlTab: SLTab){
        if(selectNoteBlock.note === 0){
            if(selectNoteBlock.section > 0){
                let n = controlTab.getNoteNumberOfSection(selectNoteBlock.section - 1) - 1;
                this.selectNoteAndMoveIndicator(selectNoteBlock.section - 1, n ,selectNoteBlock.string);
            }
        }else{
            if(controlTab.isBlankNote(selectNoteBlock.section, selectNoteBlock.note)){
                controlTab.deleteNote(selectNoteBlock.section, selectNoteBlock.note);
                controlTab.render();
                this.selectNoteAndMoveIndicator(selectNoteBlock.section , selectNoteBlock.note - 1, selectNoteBlock.string);
            }else{
                this.selectNoteAndMoveIndicator(selectNoteBlock.section, selectNoteBlock.note - 1 ,selectNoteBlock.string);
            }
        }
    }
    private selectUp(selectNoteBlock: NoteBlockIndex, controlTab: SLTab){
        if(selectNoteBlock.string > 0){
            this.selectNoteAndMoveIndicator(selectNoteBlock.section, selectNoteBlock.note ,selectNoteBlock.string - 1);
        }
    }
    private selectDown(selectNoteBlock: NoteBlockIndex, controlTab: SLTab){
        if(selectNoteBlock.string < 5){
            this.selectNoteAndMoveIndicator(selectNoteBlock.section, selectNoteBlock.note ,selectNoteBlock.string + 1);
        }
    }
    private deleteNoteBlock(selectNoteBlock: NoteBlockIndex, controlTab: SLTab){
        selectNoteBlock.data[1][selectNoteBlock.string] = -1;
        controlTab.setNoteData(selectNoteBlock.section, selectNoteBlock.note, selectNoteBlock.data);
        controlTab.render();
    }
    private drawMultiSelectRect(selectedSVGNotes: SVGNote[]){
        //Sort out the selected lines.
        let selectedLines: number[] = [];
        for(let i = 0; i < selectedSVGNotes.length; i++){
            selectedLines.push(selectedSVGNotes[i].line);
        }
        let uniqueSelectedLines = selectedLines.filter(function(elem, index, self){
            return index == self.indexOf(elem);
        });

        if (selectedSVGNotes.length > 0){
            this.unselectNoteBlock();
            type lineObj = {
                lineIndex: number;
                notes: SVGNote[];
            };
            let lineNotes: lineObj[] = [];
            for(let i = 0; i < uniqueSelectedLines.length; i++){
                let pushNotes = selectedSVGNotes.filter(function(elem, index, self){
                    return elem.line == uniqueSelectedLines[i]
                });
                lineNotes.push({lineIndex: uniqueSelectedLines[i], notes: pushNotes})
            }
            for(let i = 0; i < lineNotes.length; i++){
                //let rectIndicatorLT = this.selectedNotes[0].blockGroup[0];
                let rectIndicatorLT = lineNotes[i].notes[0].blockGroup[0];
                //Indicator's right bottom note, which provideds position.
                //let rectIndicatorRB = this.selectedNotes[this.selectedNotes.length-1].blockGroup[this.selectedNotes[this.selectedNotes.length-1].blockGroup.length-1];
                let rectIndicatorRB = lineNotes[i].notes[lineNotes[i].notes.length - 1].blockGroup[lineNotes[i].notes[lineNotes[i].notes.length - 1].blockGroup.length - 1];
                this.selectNotesIndicator.push(this.controlTab.tabCanvas.layers.ui.createRect(
                    rectIndicatorLT.x - this.selectNotesIndicatorPadding, 
                    rectIndicatorLT.y - this.selectNotesIndicatorPadding, 
                    rectIndicatorRB.x - rectIndicatorLT.x + 2 * this.selectNotesIndicatorPadding, 
                    rectIndicatorRB.y - rectIndicatorLT.y + 2 * this.selectNotesIndicatorPadding, 
                    5, 
                    "rgba(255, 182, 45, 0.6)"
                ));
            }
        }
    }
    private unselectSVGNotes(){
        this.selectedSVGNotes = []
        if(this.selectNotesIndicator.length > 0){
            this.selectNotesIndicator.forEach((elem, index, self) =>{
                elem.remove();
            });
        }
    }
    private unselectNoteBlock(){
        this.selectedBlock = null;
        this.setIndicator([-20, -20]);
    }
}
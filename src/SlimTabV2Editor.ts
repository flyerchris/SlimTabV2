import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { utils } from "./utils";
import { Rect, Ellipse, Text, Line, SVGNote} from "./SlimTabV2Canvas"

interface SingleNote{
    section: number;
    note: number;
    string: number;
    data: note;
}

export class SLEditor {
    private selectNote: SingleNote;
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
            this.selectedSVGNotes = []
        });
        this.controlTab.on("keydown", (key) => {
            if((<string>key).toLowerCase() !== " " && !isNaN(Number(key))){
                if(this.selectNote){
                    let tb = this.inputBlock * 10 + Number(key)
                    if(tb < 40){
                        this.inputBlock = tb;
                    }else{
                        this.inputBlock = Number(key);
                    }
                    this.selectNote.data[1][this.selectNote.string] = this.inputBlock;
                    // in fact you don't need to do this, but I wish to update date through api, rather change it directly.
                    this.controlTab.setNoteData(this.selectNote.section, this.selectNote.note, this.selectNote.data);
                    this.controlTab.render();
                }
            }else{
                this.inputBlock = 0;
            }
            if((<string>key).toLowerCase() === "d" || (<string>key).toLowerCase() === "arrowright"){
                if(this.selectNote){
                    let s = this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note + 1, this.selectNote.string);
                    if(!s){ // the current selection is the last note of the section
                        if(this.controlTab.isBlankNote(this.selectNote.section, this.selectNote.note)){
                            // delete the blank note and move to next section in the second time pressing "right" key
                            let pl = this.controlTab.getNoteNumberOfSection(this.selectNote.section);
                            if(pl != 1){
                                this.controlTab.deleteNote(this.selectNote.section , this.selectNote.note);
                                this.controlTab.render();
                            }
                            s = this.selectNoteAndMoveIndicator(this.selectNote.section + 1, 0, this.selectNote.string);
                            if(!s){ // the current selection is the last section and the last note
                                this.controlTab.addNote(this.selectNote.section + 1, 0, [4, [-1, -1, -1, -1, -1,-1], null]);
                                this.controlTab.render();
                                this.selectNoteAndMoveIndicator(this.selectNote.section + 1, 0, this.selectNote.string);
                            }
                        }else{
                            this.controlTab.addNote(this.selectNote.section, this.selectNote.note + 1, [4, [-1, -1, -1, -1, -1,-1], null]);
                            this.controlTab.render();
                            this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note + 1, this.selectNote.string);
                        }
                    }else{
                        if(this.controlTab.isBlankNote(this.selectNote.section, this.selectNote.note - 1)){
                            this.controlTab.deleteNote(this.selectNote.section, this.selectNote.note - 1);
                            this.controlTab.render();
                            this.selectNoteAndMoveIndicator(this.selectNote.section , this.selectNote.note - 1, this.selectNote.string);
                        }
                    }
                }
            }
            if((<string>key).toLowerCase() === "a" || (<string>key).toLowerCase() === "arrowleft"){
                if(this.selectNote){
                    if(this.selectNote.note === 0){
                        if(this.selectNote.section > 0){
                            let n = this.controlTab.getNoteNumberOfSection(this.selectNote.section - 1) - 1;
                            this.selectNoteAndMoveIndicator(this.selectNote.section - 1, n ,this.selectNote.string);
                        }
                    }else{
                        if(this.controlTab.isBlankNote(this.selectNote.section, this.selectNote.note)){
                            this.controlTab.deleteNote(this.selectNote.section, this.selectNote.note);
                            this.controlTab.render();
                            this.selectNoteAndMoveIndicator(this.selectNote.section , this.selectNote.note - 1, this.selectNote.string);
                        }else{
                            this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note - 1 ,this.selectNote.string);
                        }
                    }
                }
            }
            if((<string>key).toLowerCase() === "w" || (<string>key).toLowerCase() === "arrowup"){
                if(this.selectNote){
                    if(this.selectNote.string > 0){
                        this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note ,this.selectNote.string - 1);
                    }
                }
            }
            if((<string>key).toLowerCase() === "s" || (<string>key).toLowerCase() === "arrowdown"){
                if(this.selectNote){
                    if(this.selectNote.string < 5){
                        this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note ,this.selectNote.string + 1);
                    }
                }
            }
            if((<string>key).toLowerCase() === "delete" || (<string>key).toLowerCase() === "backspace"){
                if(this.selectNote){
                    this.selectNote.data[1][this.selectNote.string] = -1;
                    this.controlTab.setNoteData(this.selectNote.section, this.selectNote.note, this.selectNote.data);
                    this.controlTab.render();
                }
            }
            if((<string>key).toLowerCase() === "+"){
                this.changeNoteLength("-");
            }
            if((<string>key).toLowerCase() === "-"){
                this.changeNoteLength("+");
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
                console.log("start point : " + x1+" "+ y1);
                console.log("end point : " + x2+" "+y2);
                this.selectedSVGNotes = this.controlTab.areaSelect(x1, y1, x2, y2);

                //Sort out the selected lines.
                let selectedLines: number[] = [];
                for(let i = 0; i < this.selectedSVGNotes.length; i++){
                    selectedLines.push(this.selectedSVGNotes[i].line);
                }
                let uniqueSelectedLines = selectedLines.filter(function(elem, index, self){
                    return index == self.indexOf(elem);
                });

                if (this.selectedSVGNotes.length > 0){
                    if(uniqueSelectedLines.length == 1){
                        //Draw rectangle to indicate the selected notes area.
                        //Indicator's left top note, which provideds position.
                        let rectIndicatorLT = this.selectedSVGNotes[0].blockGroup[0];
                        //Indicator's right bottom note, which provideds position.
                        let rectIndicatorRB = this.selectedSVGNotes[this.selectedSVGNotes.length-1].blockGroup[this.selectedSVGNotes[this.selectedSVGNotes.length-1].blockGroup.length-1];
                        this.selectNotesIndicator.push(this.controlTab.tabCanvas.layers.ui.createRect(
                            rectIndicatorLT.x - this.selectNotesIndicatorPadding, 
                            rectIndicatorLT.y - this.selectNotesIndicatorPadding, 
                            rectIndicatorRB.x - rectIndicatorLT.x + 2 * this.selectNotesIndicatorPadding, 
                            rectIndicatorRB.y - rectIndicatorLT.y + 2 * this.selectNotesIndicatorPadding, 
                            5, 
                            "rgba(255, 182, 45, 0.6)"
                        ));
                    }
                    //If select section across two or more line, select and highlight all notes between left note and right note.
                    else{
                        //Sort the notes by line index.
                        type lineObj = {
                            lineIndex: number;
                            notes: SVGNote[];
                        };
                        let lineNotes: lineObj[] = [];
                        for(let i = 0; i < uniqueSelectedLines.length; i++){
                            let pushNotes = this.selectedSVGNotes.filter(function(elem, index, self){
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
        this.selectNote = {section: section, note: note, string: string, data: this.controlTab.getNoteData(section, note)};
    }
    private setIndicator(position: number[]){
        this.indicator.cx = position[0]
        this.indicator.cy = position[1]
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
        if(this.selectNote){
            let lengthArray = [1, 2, 4, 8, 16, 32];
            for(let i = factor ; i < lengthArray.length - 2 + factor; i++){
                if(lengthArray[i] === this.selectNote.data[0]){
                    this.selectNote.data[0] = lengthArray[i + 1 - factor * 2];
                    this.controlTab.setNoteData(this.selectNote.section, this.selectNote.note, this.selectNote.data);
                    this.controlTab.render();
                    this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note, this.selectNote.string);
                    break;
                }
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
}
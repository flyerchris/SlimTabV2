import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { utils } from "./utils";
interface SingleNote{
    section: number;
    note: number;
    string: number;
    data: note;
}
export class SLEditor {
    private selectNote: SingleNote;
    private controlTab: SLTab;
    private indicator: SVGElement;

    constructor(controlTab: SLTab){
        this.controlTab = controlTab;
        this.indicator = this.controlTab.tabCanvas.layers.ui.createEllipse(0, 0 , 8, 8);
        utils.setStyle(<HTMLElement><unknown>this.indicator,{display: "none"});
        utils.setAttributes(this.indicator,{ fill: "rgb(255, 50, 0)"});
        this.setEvents();
    }
    private setEvents(){
        this.controlTab.on("noteclick", (section, note, string, position) => {
            this.setNoteClickEvent(section, note, string, position);
        });
        this.controlTab.on("keydown", (key) => {
            if((<string>key).toLowerCase() === "d" || (<string>key).toLowerCase() === "arrowright"){
                if(this.selectNote){
                    let s = this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note + 1, this.selectNote.string);
                    if(!s){ // the current selection is the last note of the section
                        if(this.controlTab.isBlankNote(this.selectNote.section, this.selectNote.note)){
                            // delete the blank note and move to next section in the second time pressing "right" key
                            this.controlTab.deleteNote(this.selectNote.section, this.selectNote.note);
                            this.controlTab.render();
                            s = this.selectNoteAndMoveIndicator(this.selectNote.section + 1, 0, this.selectNote.string);
                            if(!s){ // the current selection is the last section and the last note
                                this.selectNoteAndMoveIndicator(this.selectNote.section , this.selectNote.note - 1, this.selectNote.string);
                            }
                        }else{
                            this.controlTab.addNote(this.selectNote.section, this.selectNote.note + 1, [4, [-1, -1, -1, -1, -1,-1], null]);
                            this.controlTab.render();
                            this.selectNoteAndMoveIndicator(this.selectNote.section, this.selectNote.note + 1, this.selectNote.string);
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
        utils.setAttributes(this.indicator,{cx: `${position[0]}`, cy: `${position[1]}`});
        utils.setStyle(<HTMLElement><unknown>this.indicator,{display: "unset"});
    }
}
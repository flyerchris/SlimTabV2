import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { Rect, Ellipse, Text, Line, SVGNote, NoteBlock} from "./SlimTabV2Canvas"
import {Timer} from "./Timer"
import {SLEditor} from "./SlimTabV2Editor"

interface TimeSignature{
    upper: number,
    lower: number
}

interface IndicatorShape{
    x: number,
    y: number,
    width: number,
    height: number
}

export class SLPract {
    private controlTab: SLTab;
    private editor: SLEditor;
    private inputBlock: number = 0;
    private nowPlaySection: number = 0;
    private nowPlaySectionIndicator: Rect;
    private bpm: number = 120;
    private loadSheets: any[];
    private timeSignature: TimeSignature = {upper: 4, lower: 4};
    private isRepeat: boolean = false;
    private indicatorColor: string = "rgba(255, 209, 81, 0.6)";
    private indicatorShapes: IndicatorShape[] = [];
    private playSwitch: boolean = false;
    private timer: Timer = new Timer();

    constructor(controlTab: SLTab, editor: SLEditor){
        this.controlTab = controlTab;
        this.editor = editor;
        this.setEvents();
    }

    play (){
        if(this.editor.SelectedNotes.length>0){//If selected more then one note swap to repeat playing mode
            this.isRepeat = true;
            let sectionNotes = this.sortBySectionId(this.editor.SelectedNotes);
            let sectionLenSum: number = 0;
            this.editor.undisplayIndicator();

            if(this.nowPlaySectionIndicator != null){
                this.nowPlaySectionIndicator.remove();
            }
            sectionNotes.forEach((elem, index, self) =>{
                let sectionEnds = this.sectionTwoEnds(elem);
                if(index == 0){
                    this.nowPlaySectionIndicator = this.controlTab.tabCanvas.layers.ui.createRect(sectionEnds.x1, sectionEnds.y1, sectionEnds.x2 - sectionEnds.x1, sectionEnds.y2 - sectionEnds.y1, 2, this.indicatorColor);
                }
                let sectionLen: number = 0;
                elem.forEach((note, i, s) =>{
                    let thisNote: note = this.controlTab.getNoteData(note.section, note.note);
                    sectionLen += this.noteValeu2Time(thisNote[0]);
                });
                sectionLenSum += sectionLen
                if(self.length == 1){
                    this.timer.registerDelay(this.stopNowPlayIndicator.bind(this), sectionLen*1000, 1);
                }
                else if(self.length > 1 && index < self.length -1){
                    let nextSectionEnds = this.sectionTwoEnds(self[index+1]);
                    this.indicatorShapes.push({x: nextSectionEnds.x1, y: nextSectionEnds.y1, width: nextSectionEnds.x2 - nextSectionEnds.x1, height: nextSectionEnds.y2 - nextSectionEnds.y1});
                    this.timer.registerDelay(this.pushNowPlayIndicator.bind(this), sectionLenSum*1000, 1);
                }
                else if(index == self.length -1){
                    this.timer.registerDelay(this.play.bind(this), sectionLenSum*1000, 1);
                }
            });
        }
        this.timer.start();
    }
    stop(){
        this.timer.stop();
        this.stopNowPlayIndicator();
        this.indicatorShapes = [];
    }

    private pushNowPlayIndicator(){
        let nextShape = this.indicatorShapes.shift()
        this.nowPlaySectionIndicator.setPos(nextShape.x, nextShape.y);
        this.nowPlaySectionIndicator.setShape(nextShape.width, nextShape.height);
    }

    private stopNowPlayIndicator(){
        this.nowPlaySectionIndicator.remove();
    }

    private noteValeu2Time (noteValue: number): number{
        return (this.timeSignature.lower/noteValue)/(this.bpm/60)
    }

    private setEvents(){
        this.controlTab.on("keydown", (key) => {
            if((<string>key).toLowerCase() === " "){
                this.playSwitch = !this.playSwitch;
                if(this.playSwitch){
                    this.play();
                }
                else{
                    this.stop();
                }
            }
        });
    }

    private sortBySectionId(notes: SVGNote[]): Array<SVGNote[]>{
        let selectedSections: number[] = [];
        for(let i = 0; i < notes.length; i++){
            selectedSections.push(notes[i].section);
        }
        let uniqueSelectedSections = selectedSections.filter(function(elem, index, self){
            return index == self.indexOf(elem);
        });
        let ret: Array<SVGNote[]> = [];
        for(let i = 0; i < uniqueSelectedSections.length; i++){
            let pushNotes = notes.filter(function(elem, index, self){
                return elem.section == uniqueSelectedSections[i]
            });
            ret.push(pushNotes)
        }
        return ret;
    }

    private sectionTwoEnds(section: SVGNote[]): {x1: number, y1: number, x2: number, y2: number}{
        let strings = section[0].blockGroup.length
        let leftTopEnd = {x: section[0].blockGroup[0].x, y: section[0].blockGroup[0].y};
        let rightBotEnd = {x: section[section.length -1].blockGroup[strings -1].x, y: section[section.length -1].blockGroup[strings -1].y}
        if(section[0].note == 0){
            let thisSection = this.controlTab.tabCanvas.layers.ui.sectionIndicator[section[0].section];
            leftTopEnd = {x: thisSection.x, y: thisSection.y};
        }
        if(section[section.length -1].note == this.controlTab.notes[section[section.length -1].section].length -1){
            let thisSection = this.controlTab.tabCanvas.layers.ui.sectionIndicator[section[section.length -1].section];
            rightBotEnd = {x: thisSection.x + thisSection.width, y: thisSection.y + thisSection.height}
        }
        return {x1: leftTopEnd.x, y1: leftTopEnd.y, x2: rightBotEnd.x, y2: rightBotEnd.y}
    }
}
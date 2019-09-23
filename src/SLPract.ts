import { Note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { Rect, Ellipse, Text, Line, SVGNote, NoteBlock} from "./SlimTabV2Canvas"
import {Timer} from "./Timer"
import {SLEditor} from "./SlimTabV2Editor"
import {Metronome} from "./Metronome"

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
    private nowPlaySectionIndicator: Rect;
    private bpm: number = 120;
    private timeSignature: TimeSignature = {upper: 4, lower: 4};
    private isRepeat: boolean = false;
    private indicatorColor: string = "rgba(255, 209, 81, 0.6)";
    private indicatorShapes: IndicatorShape[] = [];
    private playSwitch: boolean = false;
    private timer: Timer = new Timer();
    private metronome: Metronome;
    private playLag: number = 50/1000;
    private selectedTimeSum = 0;
    private metronomeOn: boolean = false;
    private playIter: number = 0;
    private maxPracticeTimes: number = 2;

    constructor(controlTab: SLTab, editor: SLEditor, metronome: Metronome){
        this.controlTab = controlTab;
        this.editor = editor;
        this.metronome = metronome;
        this.setEvents();
    }

    play (){
        if(this.playIter == this.maxPracticeTimes || (this.playIter>0 && !this.isRepeat)) {
            this.stop();
            return
        }

        let sectionNotes: SVGNote[][];
        if(this.editor.SelectedNotes.length>0){//If selected more then one note swap to repeat playing mode
            this.isRepeat = true;
            sectionNotes = this.sortBySectionId(this.editor.SelectedNotes);
        }
        else{
            this.isRepeat = false;
            let selection = this.controlTab.headToEndSelect(this.controlTab.noteIndex(this.editor.selectedNote));
            sectionNotes = this.sortBySectionId(selection);
        }
        let sectionLenSum: number = 0;
        let preBeat: number = 0;
        
        let sectionMetronomeBeats: number[] = [];

        this.editor.undisplayIndicator();

        sectionNotes.forEach((elem, index, self) =>{
            let sectionEnds = this.sectionTwoEnds(elem);
            let sectionBeats: number = 0;
            if(index == 0){
                if(this.nowPlaySectionIndicator  == null){
                    this.nowPlaySectionIndicator = this.controlTab.tabCanvas.layers.ui.createRect(sectionEnds.x1, sectionEnds.y1, sectionEnds.x2 - sectionEnds.x1, sectionEnds.y2 - sectionEnds.y1, 2, this.indicatorColor);
                }
                else{
                    this.nowPlaySectionIndicator.setPos(sectionEnds.x1, sectionEnds.y1);
                    this.nowPlaySectionIndicator.setShape(sectionEnds.x2 - sectionEnds.x1, sectionEnds.y2 - sectionEnds.y1);
                }
                //If the first note selected is note on the beat, calc a prebeat note value.
                if(elem[0].note != 0){
                    let preSum: number = 0;
                    let firstSection: Note[] = this.controlTab.getSectionData(elem[0].section);
                    for(let i = 0;i< elem[0].note; i++){
                        preSum += this.timeSignature.lower/firstSection[i][0];
                    } 
                    if(preSum %1 != 0){
                        preBeat = this.timeSignature.lower/(1 - (preSum%1));
                    }
                }
            }

            let sectionLen: number = 0;
            elem.forEach((note, i, s) =>{
                let thisNote: Note = this.controlTab.getNoteData(note.section, note.note);
                sectionLen += this.noteValeu2Time(thisNote[0]);
                sectionBeats += this.timeSignature.lower/thisNote[0];
            });
            sectionLenSum += sectionLen;
            sectionMetronomeBeats.push(sectionBeats);
            
            if(self.length == 1){
                this.timer.registerDelay(this.stopNowPlayIndicator.bind(this), sectionLen*1000, 1);
            }
            else if(self.length > 1 && index < self.length -1){
                let nextSectionEnds = this.sectionTwoEnds(self[index+1]);
                this.indicatorShapes.push({x: nextSectionEnds.x1, y: nextSectionEnds.y1, width: nextSectionEnds.x2 - nextSectionEnds.x1, height: nextSectionEnds.y2 - nextSectionEnds.y1});
                this.timer.registerDelay(this.pushNowPlayIndicator.bind(this), sectionLenSum*1000, 1);
            }
            if(index == self.length -1){
                this.timer.registerDelay(this.play.bind(this), sectionLenSum*1000, 1);
            }
        });
        let sectionStartTime: number = 0;

        if(this.playIter == 0){
            let repeatTime = 1;
            if(this.isRepeat) repeatTime =this.maxPracticeTimes;
            for(let i = 0 ; i < repeatTime; i++){
                sectionMetronomeBeats.forEach((el, i, self) =>{
                    if(this.selectedTimeSum == 0 && sectionStartTime == 0) sectionStartTime += this.playLag;
                    let sectionDuration = el * 60 /this.bpm;
                    this.registerSectionMetronome(this.selectedTimeSum + sectionStartTime, el, sectionNotes[i][0].note == 0, preBeat);
                    sectionStartTime += sectionDuration;
                })
            }
        }
        this.selectedTimeSum += sectionStartTime;
        this.playIter += 1;
        this.timer.start();
        if(!this.metronomeOn){
            this.metronome.play();
            this.metronomeOn = true;
        }
    }
    stop(){
        this.timer.stop();
        this.stopNowPlayIndicator();
        this.indicatorShapes = [];
        this.metronome.stopTick();
        this.metronomeOn = false;
        this.selectedTimeSum = 0;
        this.playIter = 0;
        this.editor.displayIndicator();
        this.playSwitch = false;
    }

    private pushNowPlayIndicator(){
        let nextShape = this.indicatorShapes.shift();
        this.nowPlaySectionIndicator.setPos(nextShape.x, nextShape.y);
        this.nowPlaySectionIndicator.setShape(nextShape.width, nextShape.height);
    }

    private stopNowPlayIndicator(){
        if(this.nowPlaySectionIndicator != null){
            this.nowPlaySectionIndicator.remove();
            this.nowPlaySectionIndicator = null;
        }
    }

    private noteValeu2Time (noteValue: number): number{
        if(noteValue == 0) return 0;
        else return (this.timeSignature.lower/noteValue)/(this.bpm/60);
    }

    private registerSectionMetronome(startTime: number, sectionBeats: number, firstClick: boolean, preBeat?: number){
        if(preBeat == NaN){
            preBeat = 0;
        }
        let pre = this.timeSignature.lower/preBeat
        if(pre == Infinity) pre = 0;
        //Metronome click first beat on the section
        if(firstClick) {
            this.metronome.scheduleTick(startTime*1000, 'strong');
        }
        else {
            this.metronome.scheduleTick((startTime + this.noteValeu2Time(preBeat))*1000, 'normal');
        }
        for(let i = 1; i < Math.floor(sectionBeats - pre); i++){
            this.metronome.scheduleTick((startTime + i * this.noteValeu2Time(this.timeSignature.lower) + this.noteValeu2Time(preBeat))*1000, 'normal')
        }
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
                return elem.section == uniqueSelectedSections[i];
            });
            ret.push(pushNotes);
        }
        return ret;
    }

    private sectionTwoEnds(section: SVGNote[]): {x1: number, y1: number, x2: number, y2: number}{
        let strings = section[0].blockGroup.length;
        let leftTopEnd = {x: section[0].blockGroup[0].x, y: section[0].blockGroup[0].y};
        let rightBotEnd = {x: section[section.length -1].blockGroup[strings -1].x, y: section[section.length -1].blockGroup[strings -1].y};
        if(section[0].note == 0){
            let thisSection = this.controlTab.tabCanvas.layers.ui.sectionIndicator[section[0].section];
            leftTopEnd = {x: thisSection.x, y: thisSection.y};
        }
        if(section[section.length -1].note == this.controlTab.notes[section[section.length -1].section].length -1){
            let thisSection = this.controlTab.tabCanvas.layers.ui.sectionIndicator[section[section.length -1].section];
            rightBotEnd = {x: thisSection.x + thisSection.width, y: thisSection.y + thisSection.height};
        }
        return {x1: leftTopEnd.x, y1: leftTopEnd.y, x2: rightBotEnd.x, y2: rightBotEnd.y};
    }
}
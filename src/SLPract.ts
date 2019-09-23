import { Note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { Rect, Ellipse, Text, Line, SVGNote, NoteBlock, SLCanvas, SLLayer, Layer} from "./SlimTabV2Canvas"
import {Timer} from "./Timer"
import {SLEditor} from "./SlimTabV2Editor"
import {Metronome} from "./Metronome"

// Assume Licap will give timestamp, string(channel), note, style. 
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

interface MidiInput{
    time: number,
    channel: number,
    note: number,
    style?: string
}

interface AnalyzeResult{
    section: number,
    note: number,
    noteId: number,
    channel: number,
    playedNote: number,
    sheetNote: number,
    playedTime: number,
    sheetTime: number,
    timeResult: TimeResult,
    noteResult: boolean,
    playedStyle?: string,
    sheetStyle?: string,
    playedAmplitude?: number,
    sheetPlayedAmplitude?: number
}

interface SectionBeatInfo{
    beatCount: number,
    preBeat: number
}

interface NoteInfo{
    section: number,
    note: number,
    noteId: number,
    noteValue: number,
    noteTime: number,
    stringContent: number[],
    style?: any
}

type AnlyzeMethod = "section" | "whole";
type TimeResult = "correct" | "rush" | "drag";

export class SLPract {
    private controlTab: SLTab;
    private editor: SLEditor;
    private nowPlaySectionIndicator: Rect;
    private bpm: number = 120;
    private timeSignature: TimeSignature = {upper: 4, lower: 4};
    private isRepeat: boolean = false;
    private indicatorShapes: IndicatorShape[] = [];
    private resultUIElements: Text[] = [];

    //Color configs 
    private indicatorColor: string = "rgba(255, 209, 81, 0.6)";
    private correctResultColor: string = "rgba(0, 163, 250, 0.9)";
    private wrongResultColor: string = "rgba(250, 80, 0, 0.9)";

    private playFlag: boolean = false;
    private timer: Timer = new Timer();
    private metronome: Metronome;
    private playLag: number = 50/1000;
    private selectedTimeSum = 0;
    private metronomeOn: boolean = false;
    private playIter: number = 0;
    private maxPracticeTimes: number = 2;
    
    private openStringTunes: number[] = [40, 45, 50, 55, 59, 64]; //E2, A2, D3, G3, B3, E4
    private deviceStartTime: number = 0;
    private collectPractContent: MidiInput[] = [];

    private anlyzeMethod: AnlyzeMethod = "section";
    private correctTolerance: number = 30;

    private devices: number[] = [];

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
        if(this.playIter > 0){
            let result = this.practiceAnalyze(this.collectPractContent,this.deviceStartTime, new Date().getTime());
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
        /**
         * setPracticeSectionIndicator(whole selected note info)
         * 
         * 
         * 
         * 
         */

        //////////////////////////////
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
                // console.log(note)
                let thisNote: Note = this.controlTab.getNoteData(note.section, note.note);
                // console.log(thisNote)
                sectionLen += this.noteValeu2Time(thisNote.noteValue);
                sectionBeats += this.timeSignature.lower/thisNote.noteValue;
            });
            sectionLenSum += sectionLen;
            sectionMetronomeBeats.push(sectionBeats);
            
            if(self.length == 1){
                this.timer.registerDelay(this.stopNowPlaySectionIndicator.bind(this), sectionLen*1000, 1);
            }
            else if(self.length > 1 && index < self.length -1){
                let nextSectionEnds = this.sectionTwoEnds(self[index+1]);
                this.indicatorShapes.push({x: nextSectionEnds.x1, y: nextSectionEnds.y1, width: nextSectionEnds.x2 - nextSectionEnds.x1, height: nextSectionEnds.y2 - nextSectionEnds.y1});
                this.timer.registerDelay(this.pushNowPlaySectionIndicator.bind(this), sectionLenSum*1000, 1);
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
        //////////////////////////
        this.timer.start();
        if(!this.metronomeOn){
            this.metronome.play();
            this.metronomeOn = true;
        }

        //Start practicer analyze section.
        this.deviceStartTime = new Date().getTime();


    }
    stop(){
        this.timer.stop();
        this.stopNowPlaySectionIndicator();
        this.indicatorShapes = [];
        this.metronome.stopTick();
        this.metronomeOn = false;
        this.selectedTimeSum = 0;
        this.playIter = 0;
        this.editor.displayIndicator();
        this.playFlag = false;

        let result = this.practiceAnalyze(this.collectPractContent,this.deviceStartTime, new Date().getTime());
        this.drawAnalyzeUI(this.controlTab.tabCanvas.layers.ui, result);
    }

    bindDevice(){

    }

    onPluck(input: MidiInput){
        if(this.playFlag){
            this.collectPractContent.push(input);
        }
    }

    private loadSheetNote(): NoteInfo[]{
        let loadedSheet: NoteInfo[] = []
        let noteTime = 0;
        let noteId = 0;
        this.controlTab.notes.forEach((elem, i, self) =>{
            elem.forEach((el, j, s) =>{
                loadedSheet.push({"section":i, "note": j,"noteId": noteId, "noteValue": el.noteValue, 'noteTime': noteTime, 'stringContent': el[1], "style": el[2]});
                noteTime += this.noteValeu2Time(el.noteValue) * 1000;
                noteId += 1;
            });
        });
        return loadedSheet;
    }
    private playPracticeSectionIndicator(){
        this.timer.start();
    }
    private setPracticeSectionIndicator(sectionNotes: SVGNote[][]){
        let sectionLenSum: number = 0;
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
            }
            let sectionLen: number = 0;
            elem.forEach((note, i, s) =>{
                let thisNote: Note = this.controlTab.getNoteData(note.section, note.note);
                sectionLen += this.noteValeu2Time(thisNote.noteValue);
                sectionBeats += this.timeSignature.lower/thisNote.noteValue;
            });
            sectionLenSum += sectionLen;
            
            if(self.length == 1){
                this.timer.registerDelay(this.stopNowPlaySectionIndicator.bind(this), sectionLen*1000, 1);
            }
            else if(self.length > 1 && index < self.length -1){
                let nextSectionEnds = this.sectionTwoEnds(self[index+1]);
                this.indicatorShapes.push({x: nextSectionEnds.x1, y: nextSectionEnds.y1, width: nextSectionEnds.x2 - nextSectionEnds.x1, height: nextSectionEnds.y2 - nextSectionEnds.y1});
                this.timer.registerDelay(this.pushNowPlaySectionIndicator.bind(this), sectionLenSum*1000, 1);
            }
            if(index == self.length -1){
                this.timer.registerDelay(this.play.bind(this), sectionLenSum*1000, 1);
            }
        });
    }

    private pushNowPlaySectionIndicator(){
        let nextShape = this.indicatorShapes.shift();
        this.nowPlaySectionIndicator.setPos(nextShape.x, nextShape.y);
        this.nowPlaySectionIndicator.setShape(nextShape.width, nextShape.height);
    }

    private stopNowPlaySectionIndicator(){
        if(this.nowPlaySectionIndicator != null){
            this.nowPlaySectionIndicator.remove();
            this.nowPlaySectionIndicator = null;
        }
    }

    private getSetionBeats(sectionNotes: SVGNote[]){
        // If the first note selected is note on the beat, calc a prebeat note value.
        let preBeat = 0;
        if(sectionNotes[0].note != 0){
            let preSum: number = 0;
            let sectionNoteRaw: Note[] = this.controlTab.getSectionData(sectionNotes[0].section);
            for(let i = 0;i< sectionNotes[0].note; i++){
                preSum += this.timeSignature.lower/sectionNoteRaw[i][0];
            } 
            if(preSum %1 != 0){
                preBeat = this.timeSignature.lower/(1 - (preSum%1));
            }
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
                this.playFlag = !this.playFlag;
                if(this.playFlag){
                    this.play();
                }
                else{
                    this.stop();
                }
                this.clearAnalyzeUI();
            }
            if((<string>key).toLowerCase() === "q"){
                this.onPluck({"channel": 0, "note": 0, "time": new Date().getTime()})
            }
        });
        this.controlTab.on("mousedown", (x, y) =>{
            this.clearAnalyzeUI();
        })
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

    private practiceAnalyze(input: MidiInput[], devicePlayTime: number, deviceEndTime: number): AnalyzeResult[]{
        let loadedSheetMusic: NoteInfo[] = this.loadSheetNote();
        let sheetMusic: NoteInfo[] = loadedSheetMusic.filter((elem, index, self) =>{
            return elem.noteTime>= devicePlayTime - this.deviceStartTime && elem.noteTime <= deviceEndTime -this.deviceStartTime;
        });


        let rets: AnalyzeResult[] = [];
        input.forEach((elem, index, self) => {
            let ret: AnalyzeResult;
            if(elem.time < devicePlayTime || elem.time > deviceEndTime){
                return
            }
            let mappedNote = this.timeNoteMapping(elem.time - this.deviceStartTime, sheetMusic);
            let timeResult: TimeResult;
            let noteResult: boolean;

            //Check if playing input is correct and return results.
            if(Math.abs((elem.time - this.deviceStartTime) - (sheetMusic[mappedNote].noteTime+this.playLag)) <= this.correctTolerance){
                timeResult = "correct";
            }
            else if((elem.time - this.deviceStartTime) - (sheetMusic[mappedNote].noteTime+this.playLag) > 0){
                timeResult = "drag";
            }
            else{
                timeResult = 'rush';
            }

            if(elem.note == sheetMusic[mappedNote].stringContent[elem.channel]){
                noteResult = true;
            }
            else{
                noteResult = false;
            }

            ret = {
                "section": sheetMusic[mappedNote].section,
                "note": sheetMusic[mappedNote].note,
                "channel": elem.channel,
                "playedNote": elem.note,
                "sheetNote": sheetMusic[mappedNote].stringContent[elem.channel],
                "playedTime": elem.time - this.deviceStartTime,
                "sheetTime": sheetMusic[mappedNote].noteTime,
                "noteId": sheetMusic[mappedNote].noteId,
                "timeResult": timeResult,
                "noteResult": noteResult
            }
            rets.push(ret);
        })
        return rets;
    }

    private drawAnalyzeUI(target: Layer, playResults: AnalyzeResult[]){
        playResults.forEach((result, index, self)=>{
            let notePos_xy = this.controlTab.getNotePosition(result.section, result.note, result.channel);
            let resultPosBias: number = 0;
            let resultText = target.createText(notePos_xy[0], notePos_xy[1], result.playedNote.toString(), "middle");
            if(result.timeResult == "correct" && result.noteResult){
                resultText.fill = this.correctResultColor;
            }
            else{
                resultText.fill = this.wrongResultColor;
            }
            
            if(result.timeResult == "drag"){
                resultPosBias = 30;
            }
            else if (result.timeResult == "rush"){
                resultPosBias = -30;
            }

            resultText.x += resultPosBias;
            
            this.resultUIElements.push();
        })
    }

    private clearAnalyzeUI(){
        this.resultUIElements.forEach((elem, index, self)=>{
            elem.remove();
        })
    }

    private timeNoteMapping(time: number, sheetMusic: NoteInfo[]): number{
        let lastTime = 0;
        for(let i = 0; i < sheetMusic.length; i++){
            if(time > lastTime && time <= sheetMusic[i].noteTime){
                if(Math.abs(time - lastTime) > Math.abs(time - sheetMusic[i].noteTime)){
                    return i;
                }
                else return i - 1;
            }
            else if (time > sheetMusic[sheetMusic.length - 1].noteTime){
                return sheetMusic.length - 1
            }
            lastTime = sheetMusic[i].noteTime;
        }
    }
}
import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { Rect, Ellipse, Text, Line, SVGNote, NoteBlock} from "./SlimTabV2Canvas"
import {Ticker} from './Ticker'

interface TimeSignature{
    upper: number,
    lower: number
}

export class SLPract {
    public controlTab: SLTab;
    private inputBlock: number = 0;
    private nowPlaySection: number = 0;
    private nowPlaySectionIndicator: Rect;
    private bpm: number = 120;
    private loadSheets: any[];
    private timeSignature: TimeSignature = {upper: 4, lower: 4};

    constructor(controlTab: SLTab){
        this.controlTab = controlTab;
    }

    play (){
        let nowSec = this.controlTab.tabCanvas.layers.ui.sectionIndicator[this.nowPlaySection];
        let sectionTime = this.timeSignature.upper / (this.bpm/60);
        this.nowPlaySectionIndicator = this.controlTab.tabCanvas.layers.ui.createRect(nowSec.x, nowSec.y, nowSec.width, nowSec.height, 2, "rgba(255, 209, 81, 0.6)");
        Ticker.registerDelay(this.pushNowPlayIndicator.bind(this), sectionTime*1000, -1);
        Ticker.start();
    }

    private pushNowPlayIndicator(){
        console.log(this.controlTab.tabCanvas.layers.ui.sectionIndicator)
        if(++this.nowPlaySection > this.controlTab.tabCanvas.layers.ui.sectionIndicator.length){
            Ticker.stop();
            Ticker.unregister(this.pushNowPlayIndicator)
            this.nowPlaySectionIndicator.remove();
            return
        }
        let pushedSec = this.controlTab.tabCanvas.layers.ui.sectionIndicator[this.nowPlaySection];
        let sectionTime = this.timeSignature.upper / (this.bpm/60);
        this.nowPlaySectionIndicator.setPos(pushedSec.x, pushedSec.y);
        this.nowPlaySectionIndicator.setShape(pushedSec.width, pushedSec.height);
    }

    private noteValeu2Time (noteValue: number): number{
        return (this.timeSignature.lower/noteValue)/(this.bpm/60)
    }
}
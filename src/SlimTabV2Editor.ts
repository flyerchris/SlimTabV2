import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
import { utils } from "./utils";
export class SLEditor {
    private selectNote: note;
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
    }
    private setNoteClickEvent(section: number, note: number, string: number, position: number[]){
        this.selectNote = this.controlTab.getNoteData(section, note);
        utils.setAttributes(this.indicator,{cx: `${position[0]}`, cy: `${position[1]}`});
        utils.setStyle(<HTMLElement><unknown>this.indicator,{display: "unset"});
    }
}
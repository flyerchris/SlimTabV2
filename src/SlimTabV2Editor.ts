import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
export class SLEditor {
    private selectNote: note;
    private controlTab: SLTab;

    constructor(controlTab: SLTab){
        this.controlTab = controlTab;
    }
}
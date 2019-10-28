import { section } from "./SlimTabV2Types"
import { SLCanvas, SLLayer } from "./SlimTabV2Canvas"
import { CaculatedNoteData } from './SlimTabV2Interface'
export class SLProp {
    tabCanvas: SLCanvas<SLLayer>;
    notes: section[];
    domElement: HTMLElement;
    inEdit: boolean = true;
    readonly lengthPerBeat: number = 4;
    readonly beatPerSection: number = 4;
    readonly containerHeight: number = 700;
    protected lineWidth: number = 1200;
    protected sectionPerLine: number = 4;
    protected stringPadding: number = 16; // distance between each string
    protected linePerPage: number = 20;
    protected lineMargin: number = 42; // only for left and right
    protected linePadding: [number, number] = [32, 14];
    protected lineDistance: number = 90; // distance between each line
    protected sectionAddNoteNumber = 8;
    protected linkerElement: SVGElement[] = [];
    protected startPosition: number[] = [this.lineMargin + this.linePadding[0] + 20, 120 + this.linePadding[1]]; // x, y
    protected lineStartPosition: [number, number] = [this.lineMargin, 120]; // total line number, last line X, last line Y
    protected height: number;
    protected width: number;
    protected calData: CaculatedNoteData[] = [];
}
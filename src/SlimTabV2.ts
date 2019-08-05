//Tablature
import {utils} from "./utils"
export class SLTab {
    private lengthPerBeat: number = 4;
    private beatPerSection: number = 4;
    private sectionWidth: number = 260; // 單位是 pixel
    private sectionPerLine: number = 4;
    private lineAdditionLength: number = 50; // 每行第一小節前方會有文字，所以要給多一點空間
    private stringPadding: number = 16;
    private linePerPage: number = 20;
    private notes: [number, number[], any][][];
    private noteElement: SVGElement[] = [];
    private svgElement: SVGElement;
    private startPosition: number[] = [90, 20]; // x, y
    private lineInfo: [number, number, number] = [0, 20, 20]; // 總行數, 最後一行的 X, 最後一行的 Y

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, sectionWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        Object.assign(this, data);
        this.notes = [
            [// 小節
                [4, [3, -1, -1, 4, -1, -1], null],// 音符長度, [格數，索引值為弦的編號，從零開始算], user data
                [4, [-1, 5, 2, -1, -1, -1], null],
                [4, [-1, 5, 2, -1, -1, -1], null],
                [4, [-1, 5, 2, -1, -1, -1], null]
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
            [
                [4, [-1, -1, -1, -1, -1, -1], null],
                [4, [-1, -1, -1, -1, -1, -1], null],
            ],
        ];
    }

    addNote(length: number, data: number[], decorator: any = null): void {
        
    }
    
    render() {
        let page = document.createElement("div");
        page.setAttribute("style","background: #CCC; position: relative;");
        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        utils.setAttributes(this.svgElement,{width: "1200", height: "600"});
        this.drawAllLine();
        this.setNoteElementData(this.calNoteRawData());
        page.append(this.svgElement);
        document.body.appendChild(page);
    }
    private drawAllLine(){
        let ln = Math.ceil(this.notes.length / this.sectionPerLine);
        if(ln > this.lineInfo[0]){
            for(let i = 0; i < ln - this.lineInfo[0]; i++){
                this.drawLine(this.lineInfo[1], this.lineInfo[2]);
                this.lineInfo[2] += 160;
            }
        }
        this.lineInfo[0] = ln;
    }
    private drawLine(x: number, y: number) {
        for(let i = 0; i < 6; i++){
            let l = this.sectionPerLine*this.sectionWidth + this.lineAdditionLength;
            let newLine = document.createElementNS('http://www.w3.org/2000/svg',"line");
            utils.setAttributes(newLine,{x1: `${x}`, y1: `${y + i*this.stringPadding}`, x2: `${x + l}`, y2: `${y + i*this.stringPadding}`, style: "stroke:black;stroke-width:1"});
            this.svgElement.appendChild(newLine);
        }
        this.drawLineTitle(x,y);

        this.drawBar(x , y);
        x += this.lineAdditionLength;
        for(let i = 1; i < this.sectionPerLine + 1; i++){
            this.drawBar(x + this.sectionWidth*i, y);
        }
    }
    private drawLineTitle(x: number, y: number){
        let title = document.createElementNS('http://www.w3.org/2000/svg',"g");
        title.innerHTML = `
        <rect x="${x + 8}" y="${y + 10}" width="20" height="60" style="fill:#ccc" />
        <text style="fill:black;font:bold 24px Sans-serif">
            <tspan x='${x + 10}' y='${y + 26}'>T</tspan>
            <tspan x='${x + 10}' y='${y + 22 + 26}'>A</tspan>
            <tspan x='${x + 10}' y='${y + 44 + 26}'>B</tspan>
        </text>
        `;
        this.svgElement.appendChild(title);
    }
    private drawBar(x: number, y: number) {
        let bar = document.createElementNS('http://www.w3.org/2000/svg',"line");
        utils.setAttributes(bar,{style: 'stroke:black;stroke-width:1'})
        utils.setAttributes(bar,{x1: `${x}`, y1: `${y}`, x2: `${x}`, y2: `${y + this.stringPadding * 5}`})
        this.svgElement.appendChild(bar);
    }

    private createNoteElement(x: number = 200, y:number = 20){
        let note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let noteHtml = `<g>
        <line style="stroke:black;stroke-width:2" x1="${x}" y1="140" x2="${x}" y2="${y}"></line>
        <line style="stroke:black;stroke-width:4" x1="${x}" y1="138" x2="${x+10}" y2="138"></line>
        <line style="stroke:black;stroke-width:2" x1="${x}" y1="130" x2="${x+10}" y2="130"></line>
        </g>`;
        for(let i = 0; i < 6 ; i++){
            noteHtml += `
                <g> 
                <circle cx='${x}' cy='${y + this.stringPadding * i}' r='6' fill='#fff' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>
                <text x='${x }' y='${y + this.stringPadding * i + 4}' text-anchor="middle" style="font:bold 12px Sans-serif">3</text>
                </g>
            `;
        }
        note.innerHTML = noteHtml;
        this.svgElement.appendChild(note);
        this.noteElement.push(note);
    }

    private calNoteRawData(): [number, number, number, number[]][]{ // x, y , length, block of every chord
        let [x, y] = this.startPosition;
        let beatLength = (this.sectionWidth - 20) / this.beatPerSection;
        let rawData: [number, number, number, number[]][] = [];
        for(let s = 0; s < this.notes.length; s++){ // section
            if(s % this.sectionPerLine == 0)x = this.startPosition[0];
            let nx = x + this.sectionWidth;
            for(let i = 0; i < this.notes[s].length; i++){ // note
                let note = this.notes[s][i];
                rawData.push([x, y, note[0], note[1]]);
                let step = beatLength * this.lengthPerBeat / note[0];
                x += step;
            }
            x = nx;
        }
        return rawData;
    }
    private setNoteElementData(data: [number, number, number, number[]][]){
        let ne = data.length - this.noteElement.length;
        for(let i = 0; i < ne; i++){
            this.createNoteElement();
        }
        for(let i = 0; i < data.length; i++){
            this.setElementPosition(this.noteElement[i], data[i][0], data[i][1]);
            //this.setChordVisiable(this.noteElement, data[i][3]);
        }
    }
    private setElementPosition(e:SVGElement, x:number, y:number){
        utils.setAttributes(e.children[0].children[0],{x1: `${x}`, y1: `${40 + y + this.stringPadding * 5}`, x2: `${x}`, y2: `${y}`});
        utils.setAttributes(e.children[0].children[1],{x1: `${x}`, y1: `${38 + y + this.stringPadding * 5}`, x2: `${x + 10}`, y2: `${38 + y + this.stringPadding * 5}`});
        utils.setAttributes(e.children[0].children[2],{x1: `${x}`, y1: `${30 + y + this.stringPadding * 5}`, x2: `${x + 10}`, y2: `${30 + y + this.stringPadding * 5}`});
        for(let i = 1 ; i <= 6; i++){
            utils.setAttributes(e.children[i].children[0], {cx: `${x}`, cy: `${y + this.stringPadding * (i-1)}`});
            utils.setAttributes(e.children[i].children[1], {x: `${x}`, y: `${y + this.stringPadding * (i-1) + 4}`});
        }
    }
}
let n = new SLTab();
n.render();
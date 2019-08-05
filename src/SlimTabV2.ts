//Tablature
import {utils} from "./utils"
export class SLTab {
    private lengthPerBeat: number = 4;
    private beatPerSection: number = 4;
    private setionWidth: number = 200; // 單位是 pixel
    private sectionPerLine: number = 4;
    private lineAdditionLength: number = 30; // 每行第一小節前方會有文字，所以要給多一點空間
    private linePadding: number = 16;
    private linePerPage: number = 20;
    private notes: [number, number[], any][][];
    private noteElement: SVGElement[] = [];
    private svgElement: SVGElement;
    private lineInfo: [number, number, number] = [0, 20, 20]; // 總行數, 最後一行的 X, 最後一行的 Y

    constructor(data?: {lengthPerBeat?: number, beatPerSection?: number, setionWidth?: number, sectionPerLine?: number, linePerPage?: number}) {
        Object.assign(this, data);
        this.notes = [
            [// 小節
                [4, [-1, -1, -1, -1, -1, -1], null],// 音符長度, [格數，索引值為弦的編號，從零開始算], user data
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
        this.createNoteElement();
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
            let l = this.sectionPerLine*this.setionWidth + this.lineAdditionLength;
            let newLine = document.createElementNS('http://www.w3.org/2000/svg',"line");
            utils.setAttributes(newLine,{x1: `${x}`, y1: `${y + i*this.linePadding}`, x2: `${x + l}`, y2: `${y + i*this.linePadding}`, style: "stroke:black;stroke-width:1"});
            this.svgElement.appendChild(newLine);
        }
        this.drawLineTitle(x,y);

        this.drawBar(x , y);
        x += this.lineAdditionLength;
        for(let i = 1; i < this.sectionPerLine + 1; i++){
            this.drawBar(x + this.setionWidth*i, y);
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
        utils.setAttributes(bar,{x1: `${x}`, y1: `${y}`, x2: `${x}`, y2: `${y + this.linePadding * 5}`})
        this.svgElement.appendChild(bar);
    }

    private createNoteElement(){
        let note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let noteHtml = "";
        let x = 200, y = 20;
        for(let i = 0; i < 6 ; i++){
            noteHtml += `
                <g> 
                <circle cx='${x}' cy='${y + this.linePadding * i}' r='6' fill='white' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>
                <text x='${x }' y='${y + this.linePadding * i + 4}' text-anchor="middle" style="font:bold 12px Sans-serif">3</text>
                </g>
            `;
        }
        note.innerHTML = noteHtml;
        this.svgElement.appendChild(note);
        this.noteElement.push(note);
    }
}
let n = new SLTab();
n.render();
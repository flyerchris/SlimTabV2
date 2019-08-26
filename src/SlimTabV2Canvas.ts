import {utils} from './utils';
import { svgNote } from './SlimTabV2Types';

interface SVGPrimitiveRenderer {
    clear(): void;
    createRect(x: number, y: number, width: number, height: number, strokeWidth: number, color: string): SVGRectElement;
    createEllipse(cx: number, cy: number, rx: number, ry: number): SVGEllipseElement;
    createText(x: number, y: number, str: string, anchor: string): SVGTextElement;
    createLine(x1: number, y1: number, x2: number, y2: number, width: number, color?: string): SVGElement;
}

export class Layer implements SVGPrimitiveRenderer {
    readonly domElement: SVGElement;

    constructor() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");
    }

    clear(): void {
        this.domElement.innerHTML = "";
    }

    createRect(x: number, y: number, width: number, height: number, strokeWidth: number, fill: string, target?: SVGElement): SVGRectElement {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(inst, {
            x: `${x}`, y:`${y}`,
            width:`${width}`, height: `${height}`,
            "stroke-width": `${strokeWidth}`,
            fill: fill,
        });
        if(!target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return inst;
    }

    createEllipse(cx: number, cy: number, rx: number, ry: number, target?: SVGElement): SVGEllipseElement {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"ellipse");
        utils.setAttributes(inst, {
            cx: `${cx}`, cy: `${cy}`,
            rx: `${rx}`, ry: `${ry}`
        });

        if(!target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return inst;
    }

    createText(x: number, y: number, str: string, anchor: string, target?: SVGElement): SVGTextElement {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"text");
        utils.setAttributes(inst, {
            x: `${x}`, y: `${y}`,
            'text-anchor': `${anchor}`
        });
        
        inst.innerHTML = `${str}`;

        if(!target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return inst;
    }
    createLine(x1: number, y1: number, x2: number, y2: number, width: number, color: string, target?: SVGElement): SVGElement {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"line");
        utils.setAttributes(inst, {
            x1: `${x1}`, y1: `${y1}`,
            x2: `${x2}`, y2: `${y2}`,
            stroke: `${color}`,
            "stroke-width": `${width}`
        });
        
        if(!target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return inst;
    };
    
}

class NoteLayer extends Layer {
    noteElements: svgNote[] = [];
    constructor(){
        super();
        utils.setAttributes(this.domElement,{"data-layer": "NoteLayer"})
    }
    createNote(): SVGElement {
        const note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const blockGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const blockArray: {groupElement: HTMLElement, word: HTMLElement, ellipse: HTMLElement}[] = [];
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        this.createLine(0, 0, 0, 0, 1, "white", lineGroup);
        for(let i = 0; i < 3 ; i++){
            this.createLine(0, 0, 0, 0, 2, "white", lineGroup);
        }
        note.append(lineGroup);
        for(let i = 0; i < 6 ; i++){
            const wordGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
            const elipse = this.createEllipse(0, 0 , 4, 6, wordGroup);
            const word = this.createText(0, 0, "", "middle", wordGroup);
            utils.setAttributes(wordGroup, {"stroke-width": '0', "stroke": "black", style: "cursor:pointer;"});
            utils.setStyle(<HTMLElement><unknown>word, {"font": "12px Sans-serif", "fill": "#fff"});
            blockGroup.append(wordGroup);
            blockArray.push({groupElement: <HTMLElement><unknown>wordGroup, word: <HTMLElement><unknown>word, ellipse: <HTMLElement><unknown>elipse});
        }
        note.append(blockGroup);
        this.noteElements.push({element: <HTMLElement><unknown>note, blockGroup: blockArray, lineGroup: lineGroup.children});
        this.domElement.append(note);
        return note;
    }
}

class SheetLayer extends Layer {
    readonly row: HTMLElement[] = [];
    readonly bar: HTMLElement[] = [];
    constructor(){
        super();
        utils.setAttributes(this.domElement,{"data-layer": "SheetLayer"})
    }
    createRow(x: number, y: number, lineWidth:number, linePadding: [number, number], stringPadding: number, sectionPerLine: number): SVGElement {
        let ng = document.createElementNS('http://www.w3.org/2000/svg',"g");
        let lineBack = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(lineBack,{x: `${x}`, y:`${y}`,style: "fill: rgba(255, 255, 255, 0.09)", width:`${linePadding[0]*2 + lineWidth}`, height: `${linePadding[1]*2 + stringPadding * 5}`});
        ng.appendChild(lineBack);
        x += linePadding[0];
        y += linePadding[1];
        for(let i = 0; i < 6; i++){
            let l = lineWidth;
            this.createLine(x, y + i*stringPadding, x + l, y + i * stringPadding, 2, "rgba(255, 255, 255, 0.24)", ng);
        }
        this.drawRowTitle(x - 30, y, ng);
        this.createLine(x, y, x, y + stringPadding * 5, 2, "rgba(255, 255, 255, 0.24)", this.domElement);
        for(let i= 0; i < sectionPerLine; i++){
            let nb = this.createLine(0, y, 0, y + stringPadding * 5, 2, "rgba(255, 255, 255, 0.24)", this.domElement);
            this.bar.push(<HTMLElement><unknown>nb);
        }
        this.domElement.append(ng);
        this.row.push(<HTMLElement><unknown>ng);
        return ng;
    }

    private drawRowTitle(x: number, y: number, target?: SVGElement): SVGElement {
        let title = document.createElementNS('http://www.w3.org/2000/svg',"g");
        title.innerHTML = `
        <text style="fill:#959595;font:17px arial;">
            <tspan x='${x + 10}' y='${y + 26}'>T</tspan>
            <tspan x='${x + 10}' y='${y + 22 + 26}'>A</tspan>
            <tspan x='${x + 10}' y='${y + 44 + 26}'>B</tspan>
        </text>
        `;
        if(target)target.append(title);
        return title;
    }
}

class UILayer extends Layer {
    readonly sectionIndicator: SVGElement[] = [];
    constructor(){
        super();
        utils.setAttributes(this.domElement,{"data-layer": "UILayer"})
    }
    createSectionIndicator(){
        let newSquare = this.createRect(0, 0, 0, 0, 0,"rgba(0, 255, 255, 0.13)")
        this.sectionIndicator.push(newSquare);
        return newSquare;
    }
}

export class Layers {
    readonly background: Layer;
    readonly sheet: SheetLayer;
    readonly notes: NoteLayer;
    readonly foreground: Layer;
    constructor(){
        this.background = new Layer();
        this.sheet = new SheetLayer();
        this.notes = new NoteLayer();
        this.foreground = new Layer();
    }
    get flattened(): Layer[] {
        return [this.background, this.sheet, this.notes, this.foreground];
    }

}

export class SLLayer extends Layers{
    readonly ui: UILayer;
    constructor(){
        super();
        this.ui = new UILayer();
    }
    get flattened(): Layer[] {
        return [this.background, this.ui, this.sheet, this.notes, this.foreground];
    }
}

export class SLCanvas<T extends Layers> {
    readonly domElement: SVGElement;
    readonly layers: T;

    constructor(private layerType: new () => T) {
        this.layers = new layerType();

        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"svg");

        this.layers.flattened.forEach(layer => this.domElement.appendChild(layer.domElement));
    }
}
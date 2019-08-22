import {utils} from './utils';

interface SVGPrimitiveRenderer {
    clear(): void;
    createRect(x: number, y: number, width: number, height: number): SVGRectElement;
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

    createRect(x: number, y: number, width: number, height: number, target?: SVGElement): SVGRectElement {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        utils.setAttributes(inst, {
            x: `${x}`, y:`${y}`,
            width:`${width}`, height: `${height}`
        });
        if(target)
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

        if(target)
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

        if(target)
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
        
        if(target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return inst;
    };
    
}

class NoteLayer extends Layer {
    createNote(x: number, y: number, fredIdx: number): SVGElement {
        const note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const blockGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        for(let i = 0; i < 6 ; i++){
            const wordGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
            const elipse = this.createEllipse(0, 0 , 4, 6, wordGroup);
            const word = this.createText(0, 0, "", "middle", wordGroup);
            utils.setAttributes(elipse, {"stroke-width": '0', "stroke": "black", style: "cursor:pointer;"});
            utils.setStyle(<HTMLElement><unknown>word, {"font": "12px Sans-serif", "fill": "#fff"});
            blockGroup.appendChild(wordGroup);
        }
        note.appendChild(blockGroup);
        this.createLine(0, 0, 0, 0, 1, "white", lineGroup);
        for(let i = 0; i < 3 ; i++){
            this.createLine(0, 0, 0, 0, 2, "white", lineGroup);
        }
        this.domElement.appendChild(note);
        return note;
    }
}

class SheetLayer extends Layer {
    note(x: number, y: number, fredIdx: number) {

    }
}

class UILayer extends Layer {

}

class Layers {
    readonly background: Layer;
    readonly sheet: SheetLayer;
    readonly notes: NoteLayer;
    readonly foreground: Layer;

    get flattened(): Layer[] {
        return [this.background, this.sheet, this.notes, this.foreground];
    }

}

class SLLayer extends Layers{
    readonly ui: UILayer;

    get flattened(): Layer[] {
        return [this.background, this.sheet, this.notes, this.foreground, this.ui];
    }
}

class SLCanvas<T extends Layers> {
    readonly domElement: SVGElement;
    readonly layers: T;

    constructor(private layerType: new () => T) {
        this.layers = new layerType();

        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");

        this.layers.flattened.forEach(layer => this.domElement.appendChild(layer.domElement));
    }
}
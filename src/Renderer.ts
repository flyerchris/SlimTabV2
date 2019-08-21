import {utils} from './utils';

interface SVGPrimitiveRenderer {
    clear(): void;
    // rect(x1: number, y1: number, x2: number, y2: number): SVGRectElement;
    rect(x: number, y: number, width: number, height: number): SVGRectElement;
    ellipse(cx: number, cy: number, rx: number, ry: number): SVGEllipseElement;
    text(x: number, y: number, str: string, anchor: string): SVGTextElement;
}

export class Layer implements SVGPrimitiveRenderer {
    readonly domElement: SVGElement;

    constructor() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");
    }

    clear(): void {
        this.domElement.innerHTML = "";
    }

    rect(x: number, y: number, width: number, height: number, target?: SVGElement): SVGRectElement {
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

    ellipse(cx: number, cy: number, rx: number, ry: number, target?: SVGElement): SVGEllipseElement {
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

    text(x: number, y: number, str: string, anchor: string, target?: SVGElement): SVGTextElement {
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
}

class NoteLayer extends Layer {
    note(x: number, y: number, fredIdx: number) {

    }
}

class SheetLayer extends Layer {
    note(x: number, y: number, fredIdx: number) {

    }
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


class Renderer<T extends Layers> {
    readonly domElement: SVGElement;
    readonly layers: T;

    constructor(private layerType: new () => T) {
        this.layers = new layerType();

        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");

        this.layers.flattened.forEach(layer => this.domElement.appendChild(layer.domElement));
    }
}


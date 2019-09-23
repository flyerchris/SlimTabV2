import {utils} from './utils';

interface SVGPrimitiveRenderer {
    clear(): void;
    createRect(x: number, y: number, width: number, height: number, strokeWidth: number, color: string): Rect;
    createEllipse(cx: number, cy: number, rx: number, ry: number): Ellipse;
    createText(x: number, y: number, str: string, anchor: string): Text;
    createLine(x1: number, y1: number, x2: number, y2: number, width: number, color?: string): Line;
}
export class NoteBlock{
    readonly domelement: HTMLElement;
    readonly word: Text;
    readonly wordBack: Text;
    readonly extendRect: Rect;
    private _x: number;
    private _y: number;
    private _section: number;
    private _note: number;
    private _string: number;
    private _line: number;

    constructor(domelement: HTMLElement, word: Text, wordBack: Text, extendRect: Rect){
        this.domelement = domelement;
        this.word = word;
        this.wordBack = wordBack;
        this.extendRect = extendRect;
    }
    set x(val: number){
        if(this._x !== val){
            this._x = val;
            this.word.x = val;
            this.wordBack.x = val;
            this.extendRect.x = val;
        }
    }
    get x(){
        return this._x;
    }
    set y(val: number){
        if(this._y !== val){
            this._y = val;
            this.word.y = val + 4;
            this.wordBack.y = val + 4;
        }
    }
    get y(){
        return this._y;
    }
    set section(val: number){
        this._section = val;
    }
    get section(): number{
        return this._section;
    }
    set note(val: number){
        this._note = val;
    }
    get note(): number{
        return this._note;
    }
    set string(val: number){
        this._string = val;
    }
    get string(): number{
        return this._string;
    }
    set line(val: number){
        this._line = val;
    }
    get line(): number{
        return this._line;
    }
}
export class SVGNote{
    readonly domelement: HTMLElement;
    readonly blockGroup: NoteBlock[] = [];
    readonly lineGroup: Line[] = [];
    readonly tail8: Base8Tail;
    readonly tail16: Base16Tail;
    readonly tail32: Base32Tail;
    private _section: number;
    private _note: number;
    private _line: number;
    constructor(domelement: HTMLElement, blockGroup: NoteBlock[], lineGroup: Line[]){
        this.domelement = domelement;
        this.blockGroup = blockGroup;
        this.lineGroup = lineGroup;
        this.tail8 = new Base8Tail();
        this.tail16 = new Base16Tail();
        this.tail32 = new Base32Tail();
        this.domelement.append(this.tail32.domElement, this.tail16.domElement, this.tail8.domElement);
    }
    set section(val: number){
        this._section = val;
    }
    get section(): number{
        return this._section;
    }
    set note(val: number){
        this._note = val;
    }
    get note(): number{
        return this._note;
    }
    set line(val: number){
        this._line = val;
    }
    get line(): number{
        return this._line;
    }
}
class Tail{
    readonly domElement: SVGElement;
    private _x: number;
    private _y: number;
    private _isShow: boolean = true;
    constructor(){
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");
        utils.setAttributes(this.domElement, {style: "fill: white;"});
        //this.hide();
    }
    setPosition(x: number, y: number){
        if(this._x !== x || this._y !== y){
            utils.setStyle(<HTMLElement><unknown>this.domElement,{"transform": `scale(0.08) translate(${x / 0.08}px,${y / 0.08}px)`});
            this._x = x;
            this._y = y;
        }
    }
    show(){
        if(!this._isShow){
            this._isShow = true;
            utils.setStyle(<HTMLElement><unknown>this.domElement,{display: "unset"});
        }
    }
    hide(){
        if(this._isShow){
            this._isShow = false;
            utils.setStyle(<HTMLElement><unknown>this.domElement,{display: "none"});
        }
    }
}
class Base8Tail extends Tail{
    constructor(){
        super();
        this.domElement.innerHTML = `<use xlink:href="#stail8"></use>`;
    }
}

class Base16Tail extends Tail{
    constructor(){
        super();
        this.domElement.innerHTML = `<use xlink:href="#stail16"></use>`
    }
}

class Base32Tail extends Tail{
    constructor(){
        super();
        this.domElement.innerHTML = `<use xlink:href="#stail32"></use>`;
    }
}
export class Layer implements SVGPrimitiveRenderer {
    readonly domElement: SVGElement;
    readonly linker: SVGElement[] = [];
    constructor() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"g");
    }

    clear(): void {
        this.domElement.innerHTML = "";
    }

    createRect(x: number, y: number, width: number, height: number, strokeWidth: number, fill: string, target?: SVGElement): Rect {
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
        return new Rect(inst);
    }

    createEllipse(cx: number, cy: number, rx: number, ry: number, target?: SVGElement): Ellipse {
        const inst = document.createElementNS('http://www.w3.org/2000/svg',"ellipse");
        utils.setAttributes(inst, {
            cx: `${cx}`, cy: `${cy}`,
            rx: `${rx}`, ry: `${ry}`
        });

        if(!target)
            this.domElement.appendChild(inst);
        else
            target.appendChild(inst);
        return new Ellipse(inst);
    }

    createText(x: number, y: number, str: string, anchor: string, target?: SVGElement): Text {
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
        return new Text(inst);
    }
    createLine(x1: number, y1: number, x2: number, y2: number, width: number, color: string, target?: SVGElement): Line {
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
        return new Line(inst);
    };
    createLinker(target?: SVGElement){
        let linker = document.createElementNS('http://www.w3.org/2000/svg',"path");
        if(!target)
            this.domElement.appendChild(linker);
        else
            target.appendChild(linker);
        
        utils.setAttributes(linker, {fill: `white`});
        this.linker.push(linker);
        return linker;
    }
}


class SVGShape {
    protected _domElement: SVGElement;
    constructor(domElement: SVGElement) {
        this._domElement = domElement;
    }
    remove() {
        this._domElement.remove();
    }
    get domElement() {
        return this._domElement;
    }
    set style(val: {[key: string]: string}){
        utils.setStyle(<HTMLElement><unknown>this.domElement, val);
    }
};

export class Rect extends SVGShape{
    constructor(domElement: SVGRectElement) {
        super(domElement);
    }
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    setPos(x: number, y: number) {
        utils.setAttributes(this.domElement, {
            "x": `${x}`, "y": `${y}`
        });
    }
    setShape(width: number, height: number) {
        utils.setAttributes(this.domElement, {
            "width": `${width}`, "height": `${height}`
        });
    }

    set x(val: number) {
        if(this._x !== val){
            this._x = val;
            utils.setAttributes(this.domElement, {
                x: `${val}`
            });
        }
    }

    get x(): number {
        return this._x;
    }

    set y(val: number){
        if(this._y !== val){
            this._y = val;
            utils.setAttributes(this.domElement, {
                y: `${val}`
            });
        }
    }

    get y(): number{
        return this._y;
    }

    set width(val: number){
        if(this._width !== val){
            this._width = val;
            utils.setAttributes(this.domElement, {
                width: `${val}`
            });
        }
    }

    get width(): number{
        return this._width;
    }
    
    set height(val: number){
        if(this._height !== val){
            this._height = val;
            utils.setAttributes(this.domElement, {
                height: `${val}`
            });
        }
    }

    get height(): number{
        return this._height;
    }

    set strokeWidth(val: number){
        utils.setAttributes(this.domElement, {
            "stroke-width": `${val}`
        });
    }

    get strokeWidth(): number{
        return Number(this.domElement.getAttribute("stroke-width"));
    }

    set fill(val: string){
        utils.setAttributes(this.domElement, {
            fill: `${val}`
        });
    }
    
    get fill(): string{
        return this.domElement.getAttribute("fill");
    }
}

export class Ellipse extends SVGShape{
    private _cx: number;
    private _cy: number;
    private _rx: number;
    private _ry: number;
    constructor(domElement: SVGEllipseElement) {
        super(domElement);
    }

    setPos(cx: number, cy: number) {
        utils.setAttributes(this.domElement, {
            "cx": `${cx}`, "cy": `${cy}`
        });
    }
    setShape(cx: number, cy: number, rx: number, ry: number) {
        utils.setAttributes(this.domElement, {
            "rx": `${rx}`, "ry": `${ry}`
        });
    }

    set cx(val: number){
        if(this._cx != val){
            this._cx = val;
            utils.setAttributes(this.domElement, {
                cx: `${val}`
            });
        }
    }
    
    get cx():number{
        return this._cx;
    }

    set cy(val: number){
        if(this._cy != val){
            this._cy = val;
            utils.setAttributes(this.domElement, {
                cy: `${val}`
            });
        }
    }

    get cy(): number{
        return this._cy;
    }

    set rx(val: number){
        if(this._rx != val){
            this._rx = val;
            utils.setAttributes(this.domElement, {
                rx: `${val}`
            });
        }
    }

    get rx(): number{
        return this._rx;
    }

    set ry(val: number){
        if(this._ry != val){
            this._ry = val;
            utils.setAttributes(this.domElement, {
                ry: `${val}`
            });
        }
    }

    get ry(): number{
        return this._ry;
    }

    set fill(val: string){
        utils.setAttributes(this.domElement, {
            fill: `${val}`
        });
    }

    get fill(): string{
        return this.domElement.getAttribute("fill");
    }
}

export class Line extends SVGShape{
    private _x1: number;
    private _x2: number;
    private _y1: number;
    private _y2: number;
    constructor(domElement: SVGElement) {
        super(domElement);
    }

    setEndPoints(x1: number, y1: number, x2: number, y2: number) {
        utils.setAttributes(this.domElement, {
            "x1": `${x1}`, "y1": `${y1}`,
            "x2": `${x2}`, "y2": `${y2}`
        });
    }

    set x1(val: number){
        if(this._x1 != val){
            this._x1 = val;
            utils.setAttributes(this.domElement, {
                x1: `${val}`
            });
        }
    }
    get x1(): number{
        return Number(this.domElement.getAttribute("x1"));
    }
    set y1(val: number){
        if(this._y1 != val){
            this._y1 = val;
        utils.setAttributes(this.domElement, {
            y1: `${val}`
        });
        }
    }
    get y1(): number{
        return Number(this.domElement.getAttribute("y1"));
    }
    set x2(val: number){
        if(this._x2 != val){
            this._x2 = val;
        utils.setAttributes(this.domElement, {
            x2: `${val}`
        });
        }
    }
    get x2(): number{
        return Number(this.domElement.getAttribute("x2"));
    }
    set y2(val: number){
        if(this._y2 != val){
            this._y2 = val;
        utils.setAttributes(this.domElement, {
            y2: `${val}`
        });
        }
    }
    get y2(): number{
        return Number(this.domElement.getAttribute("y2"));
    }
    set stroke(val: string){
        utils.setAttributes(this.domElement, {
            stroke: `${val}`
        });
    }
    get stroke(): string{
        return this.domElement.getAttribute("stroke")
    }
    set strokeWidth(val: number){
        utils.setAttributes(this.domElement, {
            "stroke-width": `${val}`
        });
    }
    get strokeWidth(): number{
        return Number(this.domElement.getAttribute("stroke-width"))
    }
}
type anchor =  "center" | "left";
export class Text extends SVGShape{
    private _x: number;
    private _y: number;
    constructor(domElement: SVGTextElement) {
        super(domElement);
    }
    setPos(x: number, y: number) {
        utils.setAttributes(this.domElement, {
            "x": `${x}`, "y": `${y}`,
        });
    }
    set x(val: number){
        if(this._x != val){
            this._x = val;
            utils.setAttributes(this.domElement, {
                x: `${val}`
            });
        }
    }
    get x(): number{
        return Number(this.domElement.getAttribute("x"));
    }
    set y(val: number){
        if(this._y != val){
            this._y = val;
            utils.setAttributes(this.domElement, {
                y: `${val}`
            });
        }
    }
    get y(): number{
        return Number(this.domElement.getAttribute("y"));
    }
    set anchor(val: anchor){
        utils.setAttributes(this.domElement, {
            "text-anchor": `${val}`
        });
    }
    get anchor(): anchor{
        return <anchor>this.domElement.getAttribute("text-anchor");
    }

    set text(val: string){
        if(this.domElement.innerHTML !== val){
            this.domElement.innerHTML = `${val}`;
        }
    }

    get text(): string{
        return this.domElement.innerHTML;
    }

    set strokeWidth(val: number){
        utils.setAttributes(this.domElement, {
            "stroke-width": `${val}`
        });
    }

    get strokeWidth(): number{
        return Number(this.domElement.getAttribute("stroke-width"));
    }
    set fill(val: string){
        utils.setAttributes(this.domElement, {
            fill: `${val}`
        });
    }
}

class NoteLayer extends Layer {
    noteElements: SVGNote[] = [];
    dot: Ellipse[] = [];
    constructor(){
        super();
        this.domElement.innerHTML = `
        <defs>
            <path id="SVGTAIL8_1" d="M-4.728,151.313l10.303,2.061l39.153-33.854c0,0,20.543-24.318,23.338-67.708L70.34,0H43.846L22.061,78.012
                l-33.854,20.901L-4.728,151.313z"/>
        	<clipPath id="SVGTAIL8_2">
                <use xlink:href="#SVGTAIL8_1"  style="overflow:visible;"/>
            </clipPath>

            <path id="stail16"d="M67.37,59.776c2.698-19.84-2.806-39.01-7.124-58.173C60.138,1.127,59.523,0.765,58.825,0c0,3.411-0.317,6.266,0.054,9.029
            c1.69,12.576,0.707,25.062-2.478,37.175c-5.494,20.897-15.163,39.32-35.394,49.69c-6.397,3.279-13.599,4.99-20.612,7.443
            l-0.168,42.842c0.429-1.459,1.031-2.899,1.881-4.318c5.712-9.535,13.379-17.275,23.422-21.731
            c11.728-5.203,21.372-12.634,29.432-22.407c0.486-0.59,1.154-1.029,2.017-1.782c-6.693,34.412-26.894,55.961-56.794,60.555
            L0,203.874c1.634-4.092,2.518-8.621,4.922-12.148c5.906-8.664,14.092-14.797,23.71-19.308c16.597-7.786,30.016-19.532,35.085-37.498
            c3.198-11.333,4.22-23.682,3.872-35.506C67.2,86.185,65.551,73.148,67.37,59.776z"/>
        
            <path id="stail8" style="clip-path:url(#SVGTAIL8_2);" d="M67.352,64.184c2.698-19.84-2.806-39.01-7.124-58.173
            c-0.107-0.476-0.722-0.837-1.42-1.603c0,3.411-0.317,6.266,0.054,9.029c1.69,12.576,0.707,25.062-2.478,37.175
            c-5.494,20.897-15.163,39.32-35.394,49.69c-6.397,3.279-13.599,4.99-20.612,7.443l-0.168,42.842
            c0.429-1.459,1.031-2.899,1.881-4.318c5.712-9.535,13.379-17.275,23.422-21.731c11.728-5.203,21.372-12.634,29.432-22.407
            c0.486-0.59,1.154-1.029,2.017-1.782c-6.693,34.412-26.894,55.961-56.794,60.555l-0.186,47.379
            c1.634-4.092,2.518-8.621,4.922-12.148c5.906-8.664,14.092-14.797,23.71-19.308c16.597-7.786,30.016-19.532,35.085-37.498
            c3.198-11.333,4.22-23.682,3.872-35.506C67.182,90.594,65.534,77.557,67.352,64.184z"/>

            <path id="SVGID_1_" d="M-4.17,255.543l10.303,2.061l39.153-33.854c0,0,20.543-24.318,23.338-67.708l2.274-51.812H44.404
                l-21.784,78.012l-33.854,20.901L-4.17,255.543z"/>
            <clipPath id="SVGID_2_">
                <use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
            </clipPath>
            <g id="stail32">
            <path d="M67.183,59.776c2.698-19.84-2.806-39.01-7.124-58.173C59.952,1.127,59.337,0.765,58.639,0c0,3.411-0.317,6.266,0.054,9.029
		c1.69,12.576,0.707,25.062-2.478,37.175c-5.494,20.897-15.163,39.32-35.394,49.69c-6.397,3.279-13.599,4.99-20.612,7.443
		l-0.168,42.842c0.429-1.459,1.031-2.899,1.881-4.318c5.712-9.535,13.379-17.275,23.422-21.731
		c11.728-5.203,21.372-12.634,29.432-22.407c0.486-0.59,1.154-1.029,2.017-1.782C50.101,130.352,29.9,151.901,0,156.495
		l-0.186,47.379c1.634-4.092,2.518-8.621,4.922-12.148c5.906-8.664,14.092-14.797,23.71-19.308
		c16.597-7.786,30.016-19.532,35.085-37.498c3.198-11.333,4.22-23.682,3.872-35.506C67.013,86.185,65.365,73.148,67.183,59.776z"/>
            <path style="clip-path:url(#SVGID_2_);" d="M67.91,168.414c2.698-19.84-2.806-39.01-7.124-58.173
			c-0.107-0.476-0.722-0.837-1.42-1.603c0,3.411-0.317,6.266,0.054,9.029c1.69,12.576,0.707,25.062-2.478,37.175
			c-5.494,20.897-15.163,39.32-35.394,49.69c-6.397,3.279-13.599,4.99-20.612,7.443l-0.168,42.842
			c0.429-1.459,1.031-2.899,1.881-4.318c5.712-9.535,13.379-17.275,23.422-21.731c11.728-5.203,21.372-12.634,29.432-22.407
			c0.486-0.59,1.154-1.029,2.017-1.782c-6.693,34.412-26.894,55.96-56.794,60.555L0.54,312.512
			c1.634-4.092,2.518-8.621,4.922-12.148c5.906-8.664,14.092-14.797,23.71-19.308c16.597-7.786,30.016-19.532,35.085-37.498
            c3.198-11.333,4.22-23.682,3.872-35.506C67.74,194.823,66.092,181.786,67.91,168.414z"/>
            </g>
        </defs>
        `;
        utils.setAttributes(this.domElement,{"data-layer": "NoteLayer"})
    }
    createNote(): SVGElement {
        const note = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const blockGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const blockArray: NoteBlock[] = [];
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
        const lg: Line[] = [];
        lg.push(this.createLine(0, 0, 0, 0, 1, "white", lineGroup));
        for(let i = 0; i < 3 ; i++){
            lg.push(this.createLine(0, 0, 0, 0, 2, "white", lineGroup));
        }
        note.append(lineGroup);
        for(let i = 0; i < 6 ; i++){
            const wordGroup = document.createElementNS('http://www.w3.org/2000/svg',"g");
            const extendRect = this.createRect(0, 0, 0, 0, 0, "rgba(0, 0, 0, 0)",wordGroup);
            const wordBack = this.createText(0, 0, "", "middle", wordGroup);
            const word = this.createText(0, 0, "", "middle", wordGroup);
            utils.setAttributes(wordGroup, {"stroke-width": '0', "stroke": "black", style: "cursor:pointer;"});
            wordBack.strokeWidth = 3; 
            wordBack.style = {font: "12px Sans-serf"}
            word.style = {"font": "12px Sans-serif", "fill": "#fff"};
            blockGroup.append(wordGroup);
            blockArray.push(new NoteBlock(<HTMLElement><unknown>wordGroup, word, wordBack, extendRect));
        }
        note.append(blockGroup);
        this.noteElements.push(new SVGNote(<HTMLElement><unknown>note, blockArray, lg));
        this.domElement.append(note);
        return note;
    }
}

class SheetLayer extends Layer {
    readonly row: HTMLElement[] = [];
    readonly bar: Line[] = [];
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
            this.bar.push(nb);
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
    readonly sectionIndicator: Rect[] = [];
    constructor(){
        super();
        utils.setAttributes(this.domElement,{"data-layer": "UILayer"})
    }
    createSectionIndicator(){
        let newSquare = this.createRect(0, 0, 0, 0, 0,"rgba(0, 255, 255, 0)");
        //utils.setAttributes(newSquare, {style: "display: none"});
        this.sectionIndicator.push(newSquare);
        return newSquare;
    }
    hightLightSection(section: number){
        utils.setAttributes(this.sectionIndicator[section].domElement, {fill: "rgba(0, 255, 255, 0.13)"});
    }
    hideSectionIndicator(section: number){
        utils.setAttributes(this.sectionIndicator[section].domElement, {fill: "rgba(0, 255, 255, 0)"});
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
        return [this.background, this.sheet, this.ui, this.notes, this.foreground];
    }
}

export class SLCanvas<T extends Layers> {
    readonly domElement: SVGElement;
    readonly layers: T;

    constructor(private layerType: new () => T) {
        this.layers = new layerType();

        this.domElement = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        utils.setStyle(<HTMLElement><unknown>this.domElement, {"user-select": "none", "outline": "none"});

        this.layers.flattened.forEach(layer => this.domElement.appendChild(layer.domElement));
    }
}
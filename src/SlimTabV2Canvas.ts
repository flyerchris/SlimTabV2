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
        this._x = val;
        this.word.x = val;
        this.wordBack.x = val;
        this.extendRect.x = val;
    }
    get x(){
        return this._x;
    }
    set y(val: number){
        this._y = val;
        this.word.y = val + 4;
        this.wordBack.y = val + 4;
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
    private _section: number;
    private _note: number;
    private _line: number;
    constructor(domelement: HTMLElement, blockGroup: NoteBlock[], lineGroup: Line[]){
        this.domelement = domelement;
        this.blockGroup = blockGroup;
        this.lineGroup = lineGroup;
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
        utils.setAttributes(this.domElement, {
            x: `${val}`
        });
    }

    get x(): number {
        return Number(this.domElement.getAttribute("x"));
    }

    set y(val: number){
        utils.setAttributes(this.domElement, {
            y: `${val}`
        });
    }

    get y(): number{
        return Number(this.domElement.getAttribute("y"));
    }

    set width(val: number){
        utils.setAttributes(this.domElement, {
            width: `${val}`
        });
    }

    get width(): number{
        return Number(this.domElement.getAttribute("width"));
    }
    
    set height(val: number){
        utils.setAttributes(this.domElement, {
            height: `${val}`
        });
    }

    get height(): number{
        return Number(this.domElement.getAttribute("height"));
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
        utils.setAttributes(this.domElement, {
            cx: `${val}`
        });
    }
    
    get cx():number{
        return Number(this.domElement.getAttribute("cx"));
    }

    set cy(val: number){
        utils.setAttributes(this.domElement, {
            cy: `${val}`
        });
    }

    get cy(): number{
        return Number(this.domElement.getAttribute("cy"));
    }

    set rx(val: number){
        utils.setAttributes(this.domElement, {
            rx: `${val}`
        });
    }

    get rx(): number{
        return Number(this.domElement.getAttribute("rx"));
    }

    set ry(val: number){
        utils.setAttributes(this.domElement, {
            ry: `${val}`
        });
    }

    get ry(): number{
        return Number(this.domElement.getAttribute("ry"));
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
        utils.setAttributes(this.domElement, {
            x1: `${val}`
        });
    }
    get x1(): number{
        return Number(this.domElement.getAttribute("x1"));
    }
    set y1(val: number){
        utils.setAttributes(this.domElement, {
            y1: `${val}`
        });
    }
    get y1(): number{
        return Number(this.domElement.getAttribute("y1"));
    }
    set x2(val: number){
        utils.setAttributes(this.domElement, {
            x2: `${val}`
        });
    }
    get x2(): number{
        return Number(this.domElement.getAttribute("x2"));
    }
    set y2(val: number){
        utils.setAttributes(this.domElement, {
            y2: `${val}`
        });
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
    constructor(domElement: SVGTextElement) {
        super(domElement);
    }
    setPos(x: number, y: number) {
        utils.setAttributes(this.domElement, {
            "x": `${x}`, "y": `${y}`,
        });
    }
    set x(val: number){
        utils.setAttributes(this.domElement, {
            x: `${val}`
        });
    }
    get x(): number{
        return Number(this.domElement.getAttribute("x"));
    }
    set y(val: number){
        utils.setAttributes(this.domElement, {
            y: `${val}`
        });
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
        this.domElement.innerHTML = `${val}`;
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
}

class NoteLayer extends Layer {
    noteElements: SVGNote[] = [];
    constructor(){
        super();
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
        let newSquare = this.createRect(0, 0, 0, 0, 0,"rgba(0, 255, 255, 0.13)");
        newSquare.style = {display: "none"};
        //utils.setAttributes(newSquare, {style: "display: none"});
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
        utils.setStyle(<HTMLElement><unknown>this.domElement, {"user-select": "none", "outline": "none"});

        this.layers.flattened.forEach(layer => this.domElement.appendChild(layer.domElement));
    }
}
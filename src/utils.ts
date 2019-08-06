export namespace utils {
    export function setAttributes(el: Element, attr:{[key: string]: string}){
        for(let k in attr){
            el.setAttribute(k, attr[k]);
        }
    }
    export function setStyle(el: HTMLElement, style:{[key: string]: string}){
        for(let k in style){
            el.style.setProperty(k, style[k]);
        }
    }
}

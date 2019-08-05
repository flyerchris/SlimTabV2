let utils = {
    setAttributes: function(el:Element, attr:{[key: string]: string}){
        for(let k in attr){
            el.setAttribute(k, attr[k]);
        }
    },
    setStyle: function(el:HTMLElement, style:{[key: string]: string}){
        for(let k in style){
            el.style.setProperty(k, style[k]);
        }
    }
}

export {utils};
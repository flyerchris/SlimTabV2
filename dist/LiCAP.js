var LiCAP=function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(t,e,n){"use strict";var r;n.d(e,"b",function(){return r}),n.d(e,"a",function(){return i}),function(t){t.setAttributes=function(t,e){for(let n in e)t.setAttribute(n,e[n])},t.setStyle=function(t,e){for(let n in e)t.style.setProperty(n,e[n])};const e={C:0,"C#":1,D:2,"D#":3,E:4,F:5,"F#":6,G:7,"G#":8,A:9,"A#":10,B:11},n=/^([CDEFGAB]#?)([0-9])$/;t.noteToDecimal=function(t){let r=n.exec(t);return 3!=r.length?-1:e[r[1]]+12*(Number(r[2])+1)}}(r||(r={}));class o{constructor(){this.funcs=[]}callAll(...t){this.funcs.forEach(e=>{e(...t)})}push(t){this.funcs.push(t)}}class i{constructor(t){t.forEach(t=>{this[t]=new o})}}},function(t,e,n){"use strict";n.r(e),n.d(e,"LiCAP",function(){return i});var r=n(0),o=function(t,e,n,r){return new(n||(n=Promise))(function(o,i){function c(t){try{s(r.next(t))}catch(t){i(t)}}function u(t){try{s(r.throw(t))}catch(t){i(t)}}function s(t){t.done?o(t.value):new n(function(e){e(t.value)}).then(c,u)}s((r=r.apply(t,e||[])).next())})};class i{constructor(t){this.device=t,this.callbacks=new r.a(["pick"]),this.device.onmidimessage=this.onMessage.bind(this)}on(t,e){t in this.callbacks&&this.callbacks[t].push(e)}static isSupported(){return navigator.requestMIDIAccess}static enumerate(){return o(this,void 0,void 0,function*(){let t=[];if(i.isSupported()){let e=yield navigator.requestMIDIAccess();for(let n of e.inputs.values())if(console.log(n.name),n.name.match(/STM32 Virtual ComPort/)){t.push(new i(n)),console.log(`use ${n.name}`);break}}return t})}onMessage(t){let e=15&t.data[0];switch(t.data[0]>>4&15){case 8:break;case 9:this.callbacks.pick.callAll(e,t.data[1],t.data[2]/255,t.timeStamp)}}}}]);
//# sourceMappingURL=LiCAP.js.map
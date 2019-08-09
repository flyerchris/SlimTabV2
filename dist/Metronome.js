var Metronome=function(A){var t={};function e(g){if(t[g])return t[g].exports;var o=t[g]={i:g,l:!1,exports:{}};return A[g].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=A,e.c=t,e.d=function(A,t,g){e.o(A,t)||Object.defineProperty(A,t,{enumerable:!0,get:g})},e.r=function(A){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(A,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(A,"__esModule",{value:!0})},e.t=function(A,t){if(1&t&&(A=e(A)),8&t)return A;if(4&t&&"object"==typeof A&&A&&A.__esModule)return A;var g=Object.create(null);if(e.r(g),Object.defineProperty(g,"default",{enumerable:!0,value:A}),2&t&&"string"!=typeof A)for(var o in A)e.d(g,o,function(t){return A[t]}.bind(null,o));return g},e.n=function(A){var t=A&&A.__esModule?function(){return A.default}:function(){return A};return e.d(t,"a",t),t},e.o=function(A,t){return Object.prototype.hasOwnProperty.call(A,t)},e.p="",e(e.s=4)}({4:function(A,t,e){"use strict";e.r(t),e.d(t,"Metronome",function(){return g});class g{constructor(A){this.bpm=120,this.timeOffset=.05,this.audioContext=new AudioContext,A&&(this.bpm=A),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=.3,this.gainNode.connect(this.audioContext.destination),fetch(o).then(A=>A.arrayBuffer()).then(A=>this.audioContext.decodeAudioData(A)).then(A=>this.sound=A)}startTick(){if(!this.tickTimer){let A=60/this.bpm;this.audioContext.suspend();let t=this.audioContext.currentTime;this.nextTime=t+this.timeOffset+A,this.tickTimer=setInterval(()=>this.tick(),1e3*A),this.makeSound(t+this.timeOffset),this.audioContext.resume()}}stopTick(){clearInterval(this.tickTimer),this.tickTimer=null}setBpm(A){this.bpm=A}tick(){let A=this.audioContext.currentTime,t=60/this.bpm;A>this.nextTime?(this.timeOffset+=.05,this.makeSound(A+this.timeOffset),this.nextTime=A+this.timeOffset+t):(this.makeSound(this.nextTime),this.nextTime+=t)}makeSound(A){let t=this.audioContext.createBufferSource();return t.buffer=this.sound,t.connect(this.gainNode),t.start(A),t.stop(A+.05),t}}let o="data:audio/wav;base64,UklGRigHAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQQHAADw/wAAGAAgAOD+AP0I/Bj7OPr4+Uj5gPhw+BD4gPeQ96j5qPyo/vj9GPwo++j8wP9oAbAC6AOIBBADgADI/kj96PtI+9AB0AtgEYAZyCK4JlAimBkgBmjwAOUI3gDZKNco3LjlEO2o/CAQqBr4FqAM2ASw+njvCOpA+JAPOBzYDejzUOYw8PACmA1IEGAQkA8IC2AE8P44+rj2iPnQ7iDaQNOQ3QjscO6g57DjCOlA8qDzQPHY8QjzGPswBoANSBfAIGgooD51V+Ve1VDAOmgoGCAoHqggqCCYG7gQ4AJo+bj5uPEQ4jDZ2NNQ0HjPwMTbttOyy7kIweDJCNWI4YDwsPwQAwAQqB7II5AaiAxwAwgJ4BUgF6AM8APYAeAEiAZABej3oOjw4hjfGN4Q4ejo4PNQ+xj80Pzg/ggHoBboIegnWDBANZg2yCyQINAgiCcIKxAoQB9YFfAP2AbI/0D9wPqI90j0UOfQ2xjVeNUA3LDfMOXg6uDosOYg6GDrmPIQ+xAAMAoQFYAZCBRoD9gOMA+QD/APcApgEKgbYB3AFigOuAOg77jfgNwY4UDpSO/w7+DvAPE49WD++AV4Avj4cPKQ+qgKmBXgHigiWB+oFagM8AjYFZghUCLgHngX2BC4CEgC2ADQ/3AB8ANgA8j7uPMg71joyONA5ODowO6I8nD4aP44AbAKwBVgGvAY+BNwD+Ab6CzIM/gnYBUICugDsAIwBEgEIAEw/dD2OPEA8MDn4N7Q1+jVUNoQ51j02Pp4/Dj9CP6YBYAOaBLoETATkBRgF7AYcBZgD0ADwPlQ+Dj8OAFQ/wD5APUA/PAHwBCIEdAJqP+w/LgDmA1wFYAZUBewEJgI6ASABcgL8BPQFmgTwA0oCfAEWPxQ9dDzWPYw+jD9kPOQ5gjiaOag7oD2kPyI/iD9UPRA7MjrGPMY/GABCAAI+2j3iABQDsgUYBJICxgCYPz49hD22Pnw/iACMAPYBqAMgA8YDYAIKAaQATj+YP64+7D26PJ49bD70ADAA0ACGP5Y/CgAiAVYCWgJgAWo/xD9mP8gA5gF0AZgCkANyAxgCvgDSP2Y9jjzsPRg+Bj8YP5A/mD64Pao+TgA+ATIAYD6iPVI+EgCSAsIDwgNoAeYAtgA4P+YAVAEgAUgBCACaALAAAj+oPwg+Tj2WPVY9tj5EP6A/1j7+PUI9MjyYPKI9Oj0gPPQ8mj14Pmw/RABSAMYA5ADKAWIBggHcAbgBFAEmARYBIgAOPug+Bj54Pr4/IgAiAR4BmgGiAVgBKgDeAMQA0ACUAF4ADgBaAMABVgEIAIwALD/cABoAagBKAGAAOj+6Pwo/PD9+AAIA4gE8AVIBjgEgABo/Sj7aPkA+Wj5EPog+0D7APpA+XD6mPxI/jD/4P54/Uj86PsQ/Jj8IP14/cj9yP6IABgCQAS4BqgHGAcgBrgE+AHA/uD8CPyI++j7qP3Q/zgBKAE4AFj/sP5Y/mD+EABoAnADaAGI/dj6+PvI/8gCkATgBUgGsAXoBDAE4APQA3AD0AJoAjgCmAIQA/ACkAGw/4j+iP8QAvADGANoAHD+6P0Y/oj+wP6w/qj+QP9QADgBYAAo/oj86Pvg+1D70PpI+8j8wP5oAOD/KP2Q+jD5cPgQ+Pj36Pcw+OD4CPmA+Kj3MPeg9wD6gP3I/9gAwAEYAiACSAJQAqgCoAOoBDgG+AdQCQAKCAs4DIgM+AqgCCAHiAYwBgAGcAWIBOgD+AJoARAAQACoAdgCeALoAIj/YP1Y+jj4ePhg+mD8WP1Y/fj8yPyw/HD8cPtI+iD64Pqw+yj8kPwQ/bD9oP3I/MD76Ps4/eD+uABgAsgCCAIoAXgAMABoAOAAKAIQBGAFkAUQBQAEyAIYAtgBuAFwAVgBcAGAAZABqAFAATgAKAAYAbABCAG4/+D+2P5A/6j/CACAAPgAKAHYAGgAOABAAEAAGAD4/9j/sP9w/+D/+ADQARAC8AGYAWAAcP4A/eD8yP3Q/lD/UP8g/5D+mP3I/LD8MP3I/Vj+mP5o/vj9wP3o/fD9CP6A/lD/0P+w/yj/QP6I/cD8ePz4/PD9EP8IAGgA8ACwAQgCwAFAAagAoAAwAZABKAIYA7AD8AMIBKADkAJgAdgA4AAQASABAAEIAbAA+P9Y/4D/GAB4AAgASP84/xD/cP4A/iD+iP7A/rD+oP7Q/qD/gADAAOD/yP4w/lj+0P4g/0D/cP/Q//D/oP8o/0j/0P8gADgAYABQAFgAiACQABAAcP8w/5D/MACQACgAcP8Q/6j+KP7o/cj9yP0o/kD/aADwAHgBCAIwAtABQAGgAIgA4AD4AKAAWAB4AFAAsP8I/6D+wP5I/9j/EAB4/5D++P2o/Uj9OP04/sD/8ADIAUgCeAKQAg=="}});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9bbmFtZV0vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vW25hbWVdLy4vc3JjL01ldHJvbm9tZS50cyJdLCJuYW1lcyI6WyJpbnN0YWxsZWRNb2R1bGVzIiwiX193ZWJwYWNrX3JlcXVpcmVfXyIsIm1vZHVsZUlkIiwiZXhwb3J0cyIsIm1vZHVsZSIsImkiLCJsIiwibW9kdWxlcyIsImNhbGwiLCJtIiwiYyIsImQiLCJuYW1lIiwiZ2V0dGVyIiwibyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZW51bWVyYWJsZSIsImdldCIsInIiLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsInZhbHVlIiwidCIsIm1vZGUiLCJfX2VzTW9kdWxlIiwibnMiLCJjcmVhdGUiLCJrZXkiLCJiaW5kIiwibiIsIm9iamVjdCIsInByb3BlcnR5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJwIiwicyIsIl9fd2VicGFja19leHBvcnRzX18iLCJNZXRyb25vbWUiLCJbb2JqZWN0IE9iamVjdF0iLCJicG0iLCJ0aGlzIiwidGltZU9mZnNldCIsImF1ZGlvQ29udGV4dCIsIkF1ZGlvQ29udGV4dCIsImdhaW5Ob2RlIiwiY3JlYXRlR2FpbiIsImdhaW4iLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJmZXRjaCIsImJlZXAiLCJ0aGVuIiwicmVzIiwiYXJyYXlCdWZmZXIiLCJidWZmZXIiLCJkZWNvZGVBdWRpb0RhdGEiLCJkZWNvZGVCdWZmZXIiLCJzb3VuZCIsInRpY2tUaW1lciIsImN5Y2xlVGltZSIsInN1c3BlbmQiLCJhdCIsImN1cnJlbnRUaW1lIiwibmV4dFRpbWUiLCJzZXRJbnRlcnZhbCIsInRpY2siLCJtYWtlU291bmQiLCJyZXN1bWUiLCJjbGVhckludGVydmFsIiwic3RhcnRUaW1lIiwib3NjIiwiY3JlYXRlQnVmZmVyU291cmNlIiwic3RhcnQiLCJzdG9wIl0sIm1hcHBpbmdzIjoiMEJBQ0UsSUFBSUEsRUFBbUIsR0FHdkIsU0FB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YUFBYXlCLFVBRzFCN0IsV0FDSThCLGNBQWM1QixLQUFLa0IsV0FDbkJsQixLQUFLa0IsVUFBWSxLQUVyQnBCLE9BQU9DLEdBQ0hDLEtBQUtELElBQU1BLEVBRVBELE9BQ0osSUFBSXVCLEVBQUtyQixLQUFLRSxhQUFhb0IsWUFDdkJILEVBQVksR0FBS25CLEtBQUtELElBQ3ZCc0IsRUFBS3JCLEtBQUt1QixVQUNUdkIsS0FBS0MsWUFBYyxJQUNuQkQsS0FBSzBCLFVBQVVMLEVBQUtyQixLQUFLQyxZQUN6QkQsS0FBS3VCLFNBQVdGLEVBQUtyQixLQUFLQyxXQUFha0IsSUFFdkNuQixLQUFLMEIsVUFBVTFCLEtBQUt1QixVQUNwQnZCLEtBQUt1QixVQUFZSixHQUdqQnJCLFVBQVcrQixHQUNmLElBQUlDLEVBQU05QixLQUFLRSxhQUFhNkIscUJBSzVCLE9BSkFELEVBQUloQixPQUFTZCxLQUFLaUIsTUFDbEJhLEVBQUl2QixRQUFRUCxLQUFLSSxVQUNqQjBCLEVBQUlFLE1BQU1ILEdBQ1ZDLEVBQUlHLEtBQUtKLEVBQVksS0FDZEMsR0FJZixJQUFJcEIsRUFBTyIsImZpbGUiOiJNZXRyb25vbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNCk7XG4iLCJleHBvcnQgY2xhc3MgTWV0cm9ub21lIHtcclxuICAgIHByaXZhdGUgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQ7XHJcbiAgICBwcml2YXRlIG5leHRUaW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGdhaW5Ob2RlOiBHYWluTm9kZTtcclxuICAgIHByaXZhdGUgdGlja1RpbWVyOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGJwbTogbnVtYmVyID0gMTIwO1xyXG4gICAgcHJpdmF0ZSB0aW1lT2Zmc2V0ID0gMC4wNTtcclxuICAgIHByaXZhdGUgc291bmQ6IEF1ZGlvQnVmZmVyO1xyXG4gICAgY29uc3RydWN0b3IoYnBtOiBudW1iZXIpe1xyXG4gICAgICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgICAgIGlmKGJwbSl0aGlzLmJwbSA9IGJwbTtcclxuICAgICAgICB0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDAuMztcclxuICAgICAgICB0aGlzLmdhaW5Ob2RlLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xyXG4gICAgICAgIGZldGNoKGJlZXApXHJcbiAgICAgICAgLnRoZW4ocmVzID0+IHJlcy5hcnJheUJ1ZmZlcigpKVxyXG4gICAgICAgIC50aGVuKGJ1ZmZlciA9PiB0aGlzLmF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYnVmZmVyKSlcclxuICAgICAgICAudGhlbihkZWNvZGVCdWZmZXIgPT4gdGhpcy5zb3VuZCA9IGRlY29kZUJ1ZmZlcik7XHJcbiAgICB9XHJcbiAgICBzdGFydFRpY2soKXtcclxuICAgICAgICBpZighdGhpcy50aWNrVGltZXIpe1xyXG4gICAgICAgICAgICBsZXQgY3ljbGVUaW1lID0gNjAgLyB0aGlzLmJwbTtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb0NvbnRleHQuc3VzcGVuZCgpO1xyXG4gICAgICAgICAgICBsZXQgYXQgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcclxuICAgICAgICAgICAgdGhpcy5uZXh0VGltZSA9IGF0ICsgdGhpcy50aW1lT2Zmc2V0ICsgY3ljbGVUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLnRpY2tUaW1lciA9IHNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCBjeWNsZVRpbWUgKiAxMDAwKTtcclxuICAgICAgICAgICAgdGhpcy5tYWtlU291bmQoYXQgKyB0aGlzLnRpbWVPZmZzZXQpO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvQ29udGV4dC5yZXN1bWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdG9wVGljaygpe1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aWNrVGltZXIpO1xyXG4gICAgICAgIHRoaXMudGlja1RpbWVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIHNldEJwbShicG06IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5icG0gPSBicG07XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHRpY2soKXtcclxuICAgICAgICBsZXQgYXQgPSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcclxuICAgICAgICBsZXQgY3ljbGVUaW1lID0gNjAgLyB0aGlzLmJwbTtcclxuICAgICAgICBpZihhdCA+IHRoaXMubmV4dFRpbWUpe1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVPZmZzZXQgKz0gMC4wNTtcclxuICAgICAgICAgICAgdGhpcy5tYWtlU291bmQoYXQgKyB0aGlzLnRpbWVPZmZzZXQpO1xyXG4gICAgICAgICAgICB0aGlzLm5leHRUaW1lID0gYXQgKyB0aGlzLnRpbWVPZmZzZXQgKyBjeWNsZVRpbWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMubWFrZVNvdW5kKHRoaXMubmV4dFRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLm5leHRUaW1lICs9IGN5Y2xlVGltZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIG1ha2VTb3VuZCggc3RhcnRUaW1lOiBudW1iZXIpOiBBdWRpb0J1ZmZlclNvdXJjZU5vZGV7XHJcbiAgICAgICAgbGV0IG9zYyA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgICAgIG9zYy5idWZmZXIgPSB0aGlzLnNvdW5kO1xyXG4gICAgICAgIG9zYy5jb25uZWN0KHRoaXMuZ2Fpbk5vZGUpO1xyXG4gICAgICAgIG9zYy5zdGFydChzdGFydFRpbWUpO1xyXG4gICAgICAgIG9zYy5zdG9wKHN0YXJ0VGltZSArIDAuMDUpO1xyXG4gICAgICAgIHJldHVybiBvc2M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBiZWVwID0gXCJkYXRhOmF1ZGlvL3dhdjtiYXNlNjQsVWtsR1JpZ0hBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFnTHNBQUFCM0FRQUNBQkFBWkdGMFlRUUhBQUR3L3dBQUdBQWdBT0QrQVAwSS9CajdPUHI0K1VqNWdQaHcrQkQ0Z1BlUTk2ajVxUHlvL3ZqOUdQd28rK2o4d1A5b0FiQUM2QU9JQkJBRGdBREkva2o5NlB0SSs5QUIwQXRnRVlBWnlDSzRKbEFpbUJrZ0JtandBT1VJM2dEWktOY28zTGpsRU8yby9DQVFxQnI0RnFBTTJBU3crbmp2Q09wQStKQVBPQnpZRGVqelVPWXc4UEFDbUExSUVHQVFrQThJQzJBRThQNDQrcmoyaVBuUTdpRGFRTk9RM1Fqc2NPNmc1N0RqQ09sQThxRHpRUEhZOFFqekdQc3dCb0FOU0JmQUlHZ29vRDUxVitWZTFWREFPbWdvR0NBb0hxZ2dxQ0NZRzdnUTRBSm8rYmo1dVBFUTRqRFoyTk5RMEhqUHdNVGJ0dE95eTdrSXdlREpDTldJNFlEd3NQd1FBd0FRcUI3SUk1QWFpQXh3QXdnSjRCVWdGNkFNOEFQWUFlQUVpQVpBQmVqM29Panc0aGpmR040UTRlam80UE5RK3hqODBQemcvZ2dIb0Jib0llZ25XREJBTlpnMnlDeVFJTkFnaUNjSUt4QW9RQjlZRmZBUDJBYkkvMEQ5d1BxSTkwajBVT2ZRMnhqVmVOVUEzTERmTU9YZzZ1RG9zT1lnNkdEcm1QSVEreEFBTUFvUUZZQVpDQlJvRDlnT01BK1FEL0FQY0FwZ0VLZ2JZQjNBRmlnT3VBT2c3N2pmZ053WTRVRHBTTy93NytEdkFQRTQ5V0QrK0FWNEF2ajRjUEtRK3FnS21CWGdIaWdpV0Irb0ZhZ004QWpZRlpnaFVDTGdIbmdYMkJDNENFZ0MyQURRLzNBQjhBTmdBOGo3dVBNZzcxam95T05BNU9Eb3dPNkk4bkQ0YVA0NEFiQUt3QlZnR3ZBWStCTndEK0FiNkN6SU0vZ25ZQlVJQ3VnRHNBSXdCRWdFSUFFdy9kRDJPUEVBOE1EbjRON1ExK2pWVU5vUTUxajAyUHA0L0RqOUNQNllCWUFPYUJMb0VUQVRrQlJnRjdBWWNCWmdEMEFEd1BsUStEajhPQUZRL3dENUFQVUEvUEFId0JDSUVkQUpxUCt3L0xnRG1BMXdGWUFaVUJld0VKZ0k2QVNBQmNnTDhCUFFGbWdUd0Ewb0NmQUVXUHhROWREeldQWXcrakQ5a1BPUTVnamlhT2FnN29EMmtQeUkvaUQ5VVBSQTdNanJHUE1ZL0dBQkNBQUkrMmozaUFCUURzZ1VZQkpJQ3hnQ1lQejQ5aEQyMlBudy9pQUNNQVBZQnFBTWdBOFlEWUFJS0FhUUFUaitZUDY0KzdEMjZQSjQ5YkQ3MEFEQUEwQUNHUDVZL0NnQWlBVllDV2dKZ0FXby94RDltUDhnQTVnRjBBWmdDa0FOeUF4Z0N2Z0RTUDJZOWpqenNQUmcrQmo4WVA1QS9tRDY0UGFvK1RnQStBVElBWUQ2aVBWSStFZ0NTQXNJRHdnTm9BZVlBdGdBNFArWUFWQUVnQVVnQkNBQ2FBTEFBQWorb1B3ZytUajJXUFZZOXRqNUVQNkEvMWo3K1BVSTlNanlZUEtJOU9qMGdQUFE4bWoxNFBtdy9SQUJTQU1ZQTVBREtBV0lCZ2dIY0FiZ0JGQUVtQVJZQklnQU9QdWcrQmo1NFByNC9JZ0FpQVI0Qm1nR2lBVmdCS2dEZUFNUUEwQUNVQUY0QURnQmFBTUFCVmdFSUFJd0FMRC9jQUJvQWFnQktBR0FBT2orNlB3by9QRDkrQUFJQTRnRThBVklCamdFZ0FCby9TajdhUGtBK1dqNUVQb2crMEQ3QVBwQStYRDZtUHhJL2pELzRQNTQvVWo4NlBzUS9KajhJUDE0L2NqOXlQNklBQmdDUUFTNEJxZ0hHQWNnQnJnRStBSEEvdUQ4Q1B5SSsrajdxUDNRL3pnQktBRTRBRmovc1A1WS9tRCtFQUJvQW5BRGFBR0kvZGo2K1B2SS84Z0NrQVRnQlVnR3NBWG9CREFFNEFQUUEzQUQwQUpvQWpnQ21BSVFBL0FDa0FHdy80aitpUDhRQXZBREdBTm9BSEQrNlAwWS9vait3UDZ3L3FqK1FQOVFBRGdCWUFBby9vajg2UHZnKzFENzBQcEkrOGo4d1A1b0FPRC9LUDJRK2pENWNQZ1ErUGozNlBjdytPRDRDUG1BK0tqM01QZWc5d0Q2Z1AzSS85Z0F3QUVZQWlBQ1NBSlFBcWdDb0FPb0JEZ0crQWRRQ1FBS0NBczRESWdNK0FxZ0NDQUhpQVl3QmdBR2NBV0lCT2dEK0FKb0FSQUFRQUNvQWRnQ2VBTG9BSWovWVAxWStqajRlUGhnK21EOFdQMVkvZmo4eVB5dy9IRDhjUHRJK2lENjRQcXcreWo4a1B3US9iRDlvUDNJL01ENzZQczQvZUQrdUFCZ0FzZ0NDQUlvQVhnQU1BQm9BT0FBS0FJUUJHQUZrQVVRQlFBRXlBSVlBdGdCdUFGd0FWZ0JjQUdBQVpBQnFBRkFBVGdBS0FBWUFiQUJDQUc0LytEKzJQNUEvNmovQ0FDQUFQZ0FLQUhZQUdnQU9BQkFBRUFBR0FENC85ai9zUDl3LytELytBRFFBUkFDOEFHWUFXQUFjUDRBL2VEOHlQM1EvbEQvVVA4Zy81RCttUDNJL0xEOE1QM0kvVmorbVA1by92ajl3UDNvL2ZEOUNQNkEvbEQvMFArdy95ai9RUDZJL2NEOGVQejQvUEQ5RVA4SUFHZ0E4QUN3QVFnQ3dBRkFBYWdBb0FBd0FaQUJLQUlZQTdBRDhBTUlCS0FEa0FKZ0FkZ0E0QUFRQVNBQkFBRUlBYkFBK1A5WS80RC9HQUI0QUFnQVNQODQveEQvY1A0QS9pRCtpUDdBL3JEK29QN1EvcUQvZ0FEQUFPRC95UDR3L2xqKzBQNGcvMEQvY1AvUS8vRC9vUDhvLzBqLzBQOGdBRGdBWUFCUUFGZ0FpQUNRQUJBQWNQOHcvNUQvTUFDUUFDZ0FjUDhRLzZqK0tQN28vY2o5eVAwby9rRC9hQUR3QUhnQkNBSXdBdEFCUUFHZ0FJZ0E0QUQ0QUtBQVdBQjRBRkFBc1A4SS82RCt3UDVJLzlqL0VBQjQvNUQrK1Ayby9VajlPUDA0L3NELzhBRElBVWdDZUFLUUFnPT1cIjsiXSwic291cmNlUm9vdCI6IiJ9
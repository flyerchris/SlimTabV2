var DataAdapter=function(t){var e={};function a(r){if(e[r])return e[r].exports;var n=e[r]={i:r,l:!1,exports:{}};return t[r].call(n.exports,n,n.exports,a),n.l=!0,n.exports}return a.m=t,a.c=e,a.d=function(t,e,r){a.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},a.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},a.t=function(t,e){if(1&e&&(t=a(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(a.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)a.d(r,n,function(e){return t[e]}.bind(null,n));return r},a.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return a.d(e,"a",e),e},a.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},a.p="",a(a.s=3)}({3:function(t,e,a){"use strict";a.r(e),a.d(e,"DataAdapter",function(){return r});class r{constructor(t){this.rawData=[],this.spb=500,this.lengthPerBeat=4,t&&(this.spb=6e4/t)}receiveData(t,e,a,r){this.rawData.push([t,e,r]),this.receiveInterval||(this.receiveInterval=setTimeout(this.packNote.bind(this),10))}setSendDataCallBack(t){this.sendData=t}packNote(){let t=[-1,-1,-1,-1,-1,-1];for(let e=0;e<this.rawData.length;e++)t[this.rawData[e][0]]=3;if(this.noteRawData){let t=this.rawData[0][2]-this.preTime;if(t>this.spb*this.lengthPerBeat)this.noteRawData[0]=1;else{let e=Math.log(this.spb/t)/Math.log(2),a=(Math.log(this.spb/(3*t)),Math.log(2),Math.pow(2,Math.ceil(e-.5)));this.noteRawData[0]=this.lengthPerBeat*a}this.sendData(-1,this.noteRawData)}this.preTime=this.rawData[0][2],this.noteRawData=[8,t,null],this.rawData=[],this.receiveInterval=null}}}});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9bbmFtZV0vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vW25hbWVdLy4vc3JjL0RhdGFBZGFwdGVyLnRzIl0sIm5hbWVzIjpbImluc3RhbGxlZE1vZHVsZXMiLCJfX3dlYnBhY2tfcmVxdWlyZV9fIiwibW9kdWxlSWQiLCJleHBvcnRzIiwibW9kdWxlIiwiaSIsImwiLCJtb2R1bGVzIiwiY2FsbCIsIm0iLCJjIiwiZCIsIm5hbWUiLCJnZXR0ZXIiLCJvIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwiZ2V0IiwiciIsIlN5bWJvbCIsInRvU3RyaW5nVGFnIiwidmFsdWUiLCJ0IiwibW9kZSIsIl9fZXNNb2R1bGUiLCJucyIsImNyZWF0ZSIsImtleSIsImJpbmQiLCJuIiwib2JqZWN0IiwicHJvcGVydHkiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsInAiLCJzIiwiX193ZWJwYWNrX2V4cG9ydHNfXyIsIkRhdGFBZGFwdGVyIiwiW29iamVjdCBPYmplY3RdIiwiYnBtIiwidGhpcyIsInJhd0RhdGEiLCJzcGIiLCJsZW5ndGhQZXJCZWF0Iiwic3RyaW5nSW5kZXgiLCJub3RlIiwiYW1wIiwidGltZSIsInB1c2giLCJyZWNlaXZlSW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwicGFja05vdGUiLCJjYiIsInNlbmREYXRhIiwibm90ZXMiLCJsZW5ndGgiLCJub3RlUmF3RGF0YSIsImR1cmF0aW9uIiwicHJlVGltZSIsImwyIiwiTWF0aCIsImxvZyIsImJsIiwicG93IiwiY2VpbCJdLCJtYXBwaW5ncyI6IjRCQUNFLElBQUlBLEVBQW1CLEdBR3ZCLFNBQVNDLEVBQW9CQyxHQUc1QixHQUFHRixFQUFpQkUsR0FDbkIsT0FBT0YsRUFBaUJFLEdBQVVDLFFBR25DLElBQUlDLEVBQVNKLEVBQWlCRSxHQUFZLENBQ3pDRyxFQUFHSCxFQUNISSxHQUFHLEVBQ0hILFFBQVMsSUFVVixPQU5BSSxFQUFRTCxHQUFVTSxL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SSxLQUFLTCxFQUFLLE1BQ3BDbkIsS0FBS2dCLFlBQVksR0FBS2hCLEtBQUtHLGNBQWdCbUIsRUFFL0N0QixLQUFLYSxVQUFVLEVBQUdiLEtBQUtnQixhQUUzQmhCLEtBQUtrQixRQUFVbEIsS0FBS0MsUUFBUSxHQUFHLEdBQy9CRCxLQUFLZ0IsWUFBYyxDQUFDLEVBQUdGLEVBQU8sTUFDOUJkLEtBQUtDLFFBQVUsR0FDZkQsS0FBS1MsZ0JBQWtCIiwiZmlsZSI6IkRhdGFBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDMpO1xuIiwiZXhwb3J0IGNsYXNzIERhdGFBZGFwdGVye1xyXG4gICAgcHJpdmF0ZSByYXdEYXRhOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl1bXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwcmVUaW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG5vdGVSYXdEYXRhOiBbbnVtYmVyLCBudW1iZXJbXSwgYW55XTtcclxuICAgIHByaXZhdGUgcmVjZWl2ZUludGVydmFsOm51bWJlcjtcclxuICAgIHByaXZhdGUgc3BiOiBudW1iZXIgPSA2MCAqIDEwMDAgLyAxMjA7IC8vIHNlY29uZCBwZXIgYmVhdCwgZGVmYWx1dCB2YWx1ZSBjb3JyZXNwb25kcyB0byAxMjAgYnBtXHJcbiAgICBwcml2YXRlIGxlbmd0aFBlckJlYXQ6IG51bWJlciA9IDQ7XHJcbiAgICBwcml2YXRlIHNlbmREYXRhOiBGdW5jdGlvbjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoYnBtPzogbnVtYmVyKXtcclxuICAgICAgICBpZihicG0pe1xyXG4gICAgICAgICAgICB0aGlzLnNwYiA9IDYwICoxMDAwIC8gYnBtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlY2VpdmVEYXRhKHN0cmluZ0luZGV4OiBudW1iZXIsIG5vdGU6IG51bWJlciwgYW1wOiBudW1iZXIsIHRpbWU6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5yYXdEYXRhLnB1c2goW3N0cmluZ0luZGV4LCBub3RlLCB0aW1lXSk7XHJcbiAgICAgICAgaWYoIXRoaXMucmVjZWl2ZUludGVydmFsKXtcclxuICAgICAgICAgICAgdGhpcy5yZWNlaXZlSW50ZXJ2YWwgPSBzZXRUaW1lb3V0KHRoaXMucGFja05vdGUuYmluZCh0aGlzKSwxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0U2VuZERhdGFDYWxsQmFjayhjYjogRnVuY3Rpb24pe1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEgPSBjYjtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcGFja05vdGUoKXtcclxuICAgICAgICBsZXQgbm90ZXMgPSBbLTEsIC0xLCAtMSwgLTEsIC0xLCAtMV07XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMucmF3RGF0YS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIG5vdGVzW3RoaXMucmF3RGF0YVtpXVswXV0gPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLm5vdGVSYXdEYXRhKXtcclxuICAgICAgICAgICAgbGV0IGR1cmF0aW9uID0gdGhpcy5yYXdEYXRhWzBdWzJdIC0gdGhpcy5wcmVUaW1lO1xyXG4gICAgICAgICAgICBpZihkdXJhdGlvbiA+IHRoaXMuc3BiICogdGhpcy5sZW5ndGhQZXJCZWF0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90ZVJhd0RhdGFbMF0gPSAxO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGxldCBsMiA9IE1hdGgubG9nKHRoaXMuc3BiIC8gZHVyYXRpb24pIC8gTWF0aC5sb2coMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbDMgPSBNYXRoLmxvZyh0aGlzLnNwYiAvICgzICogZHVyYXRpb24pKSAvIE1hdGgubG9nKDIpICsgMTtcclxuICAgICAgICAgICAgICAgIGxldCBibCA9IE1hdGgucG93KDIsIE1hdGguY2VpbChsMiAtIDAuNSkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RlUmF3RGF0YVswXSA9IHRoaXMubGVuZ3RoUGVyQmVhdCAqIGJsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZERhdGEoLTEsIHRoaXMubm90ZVJhd0RhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZVRpbWUgPSB0aGlzLnJhd0RhdGFbMF1bMl07XHJcbiAgICAgICAgdGhpcy5ub3RlUmF3RGF0YSA9IFs4LCBub3RlcywgbnVsbF07XHJcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gW107XHJcbiAgICAgICAgdGhpcy5yZWNlaXZlSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgfVxyXG59Il0sInNvdXJjZVJvb3QiOiIifQ==
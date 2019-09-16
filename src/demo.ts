import { section } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2";
import { DataAdapter } from "./DataAdapter"
import { LiCAP } from "./LiCAP"
import { Metronome } from "./Metronome"
import { instrumentCorrection } from "./instrumentCorrection"
import { SLEditor } from "./SlimTabV2Editor"
import { LiCAPStream } from "./LiCAPStream"
let nt = new SLTab();
let data: section[] = [
    [// section
        // [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
        [4, [3, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
    ],
    [
        [8, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
    ]
];
nt.setData(data);
let tabEditor = new SLEditor(nt);
nt.attach(document.getElementById("slimtab"));
document.addEventListener("keydown",(e) => {
    let ka = [37, 38, 39, 40]; //left: 37, up: 38, right: 39, down: 40,
    for(let i = 0; i < ka.length; i++){// why is there no "includes" methods in typescript = =?
        if(ka[i] === e.keyCode){
            e.preventDefault();
            e.returnValue = false;  
        }
    }
});
nt.render();

let da = new DataAdapter();
LiCAP.enumerate().then((devs)=>{
    if(devs.length > 0) {
        devs[0].on("pick", da.receiveData.bind(da));
    }
});

//da.setSendDataCallBack(nt.instrumentNoteInput.bind(nt));

let beep: Metronome = new Metronome(120);
let bs = 0;
let beepEle = document.getElementById("metronome");
beepEle.onclick = function(event){
    if(bs == 0){
        beep.startTick();
        beepEle.style.background = "#e99415";
        bs = 1;
    }else{
        beep.stopTick();
        beepEle.style.background = "";
        bs = 0;
    }
}
 let win = window;
 let s: any;
 (window as any).gg = () => {s = setInterval(function(){nt.instrumentNoteInput(instrumentCorrection,[8, [-1, -1, -1, 4, -1, 6], null])}, 100);};
 (window as any).gx = () => {clearInterval(s);}
//s= setInterval(function(){nt.instrumentNoteInput(instrumentCorrection,[8, [-1, -1, -1, 4, -1, 6], null])}, 100);
nt.instrumentNoteInput(instrumentCorrection,[4, [-1, -1, -1, 4, -1, 6], null]);
nt.instrumentNoteInput(instrumentCorrection,[4, [-1, -1, -1, 4, -1, 6], null], 0, 2);


function pad(num: string, size: number){ return ('000000000' + num).substr(-size); }

nt.on("noteclick", (sectionIdx, noteIdx, stringIdx) => {
    document.getElementById("section-idx").innerText = pad(String(sectionIdx+1), 3) + ".";
})


let stream = new LiCAPStream();

document.getElementById('playstream').addEventListener('click', () => {
    stream.play();
})
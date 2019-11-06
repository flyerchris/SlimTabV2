import { section, Note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2";
import { DataAdapter } from "./DataAdapter"
import { LiCAP, LiCAPDevice } from "./LiCAP"
import { Metronome } from "./Metronome"
import { instrumentCorrection } from "./instrumentCorrection"
import { SLEditor } from "./SlimTabV2Editor"
import {SLPract} from "./SLPract"
import { KeyBoardAdapter } from "./KeyBoardAdapter"
let ka = new KeyBoardAdapter();
let nt = new SLTab();
let data: [number, number[], any][][] = [
    []
    // [// section
    //     // [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
    //     [4, [3, 5, 2, -1, -1, -1], null],
    //     [4, [-1, 5, 2, -1, -1, -1], null],
    //     [4, [-1, 5, 2, -1, -1, -1], null],
    //     [8, [-1, 5, 2, -1, -1, -1], null],
    // ],
    // [
    //     [8, [-1, 5, 2, -1, -1, -1], null],
    //     [4, [-1, 5, 2, -1, -1, -1], null],
    //     [4, [-1, 5, 2, -1, -1, -1], null],
    //     [8, [-1, 5, 2, -1, -1, -1], null],
    //     [8, [-1, 5, 2, -1, -1, -1], null],
    // ]
];
nt.setData(data);
let tabEditor = new SLEditor(nt);
nt.attach(document.getElementById("slimtab"));
document.addEventListener("keydown",(e) => {
    let ka = [32, 37, 38, 39, 40]; //space: 32, left: 37, up: 38, right: 39, down: 40,
    if(ka.includes(e.keyCode)){
        e.preventDefault();
        e.returnValue = false;
    }
});
nt.render();

let da = new DataAdapter();
da.timeOffset = 40;
let device: LiCAPDevice;
let beep: Metronome = new Metronome(120);
LiCAP.enumerate().then((devs)=>{
    if(devs.length > 0) {
        device = devs[0];
        devs[0].on("pick", (strIndex, note, amp, time)=>{
            da.startTimeOffset = -beep.getStartTime();
            da.receiveData(strIndex, note, amp, time);
        });
        devs[0].on("message", (e) => {
            da.startTimeOffset = -beep.getStartTime();
            let freq = ka.noteKeyToFrequency(e.data[1]);
            let [string, block] = ka.frequencyToStringData(freq);
            da.receiveData(string, block, e.data[2], e.timeStamp);
        });
    }
});

da.addPackListener((data: Note)=>{
    if(data.userData === "undefined-value"){
        if(nt.isSectionFull(nt.getSectionNumber() -1)){
            nt.addNote(-1 , -1, data);
        }else{
            nt.addNote(nt.getSectionNumber() -1 , -1, data);
        }
        nt.render();
    }else{
        nt.deleteNote(nt.getSectionNumber() - 1, nt.getNoteNumberOfSection(nt.getSectionNumber() - 1) -1);
        nt.instrumentNoteInput(instrumentCorrection, data);
    }
    nt.adjustPostion(nt.getSectionLeftTopPos(nt.getSectionNumber() - 1)[1]);
});
da.addDataListener((string:number, note: number, time:number)=>{
    pt.onPluck(string, note, performance.now() - 30 - 50 /*play lag*/);
})
let bs = 0;
let beepEle = document.getElementById("metronome");
let bpmDom = <HTMLInputElement>document.getElementById("metronome-bpm");
bpmDom.addEventListener("change",() =>{
    beep.setBpm(Number(bpmDom.value));
    da.setBpm(Number(bpmDom.value));
    document.getElementById("bpm-display").innerHTML = bpmDom.value;
    console.log(bpmDom.value);
});
beepEle.onclick = function(event){
    if(bs == 0){
        beep.startTick();
        beepEle.style.background = "#e99415";
        da.activate();
        bs = 1;
    }else{
        beep.stopTick();
        beepEle.style.background = "";
        da.deactivate();
        bs = 0;
    }
}
 let win = window;
 let s: any;
 (window as any).gg = () => {s = setInterval(function(){nt.instrumentNoteInput(instrumentCorrection,new Note([8, [-1, -1, -1, 4, -1, 6], null]))}, 100);};
 (window as any).gx = () => {clearInterval(s);}
//s= setInterval(function(){nt.instrumentNoteInput(instrumentCorrection,new Note([8, [-1, -1, -1, 4, -1, 6], null]))}, 100);
//nt.instrumentNoteInput(instrumentCorrection,[4, [-1, -1, -1, 4, -1, 6], null]);
//nt.instrumentNoteInput(instrumentCorrection,[4, [-1, -1, -1, 4, -1, 6], null]);
// nt.instrumentNoteInput(instrumentCorrection,[8/3, [-1, -1, -1, 4, -1, 6], null]);
//nt.instrumentNoteInput(instrumentCorrection,[4, [-1, -1, -1, 4, -1, 6], null], 0, 2);


function pad(num: string, size: number){ return ('000000000' + num).substr(-size); }

nt.on("noteclick", (sectionIdx, noteIdx, stringIdx) => {
    document.getElementById("section-idx").innerText = pad(String(sectionIdx+1), 3) + ".";
})

console.log(nt)
let pt = new SLPract(nt, tabEditor, beep);
document.addEventListener("keydown",(ev)=>{
    if((ev.key).toLowerCase() === " "){
        da.activate()
        setTimeout(() => device.resetTimer(), 2000);
    }
    if(ev.key == "r" || ev.key == "e"){
        //console.log(ev.timeStamp - beep.getStartTime());
        da.startTimeOffset = -beep.getStartTime();
        da.receiveData(1, 5, 2, ev.timeStamp - 50);
    }
});
document.getElementById('save-file').addEventListener('click', saveFile);
function saveFile(){
    let dl = document.createElement("a");
    dl.setAttribute("download", "tablature.tab");
    dl.style.display = "none";
    dl.setAttribute("href", `data:text/plain;charset=utf-8,${JSON.stringify(nt.notes)}`);
    document.body.append(dl);
    dl.click();
    document.body.removeChild(dl);
}
let loadFileEle = <HTMLInputElement>document.getElementById("load-file");
loadFileEle.style.display = "none";
loadFileEle.addEventListener("change", (ev) => {
    let reader = new FileReader();
    reader.onload = (e)=>{
        let ldata = <[number, number[], any][][]>JSON.parse(<string>(<FileReader>e.target).result);
        tabEditor.resetIndicator();
        nt.setData(ldata);
        nt.render();
    }
    reader.readAsText(loadFileEle.files[0]);
    loadFileEle.value="";
});
document.getElementById("load-f").addEventListener('click', () => {
    loadFileEle.click();
});

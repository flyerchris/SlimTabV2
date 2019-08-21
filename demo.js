let nt = new SlimTabV2.SLTab();
let data = [
    [// section
        // [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
    ],
    [
        [4, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
    ]
];
nt.setNoteData(data);
nt.render(document.getElementById("slimtab"));

let da = new DataAdapter.DataAdapter();
LiCAP.LiCAP.enumerate().then((devs)=>{
    if(devs.length > 0) {     
        devs[0].on("pick", da.receiveData.bind(da));
    }
});
//da.setSendDataCallBack(nt.instrumentNoteInput.bind(nt));

let beep = null;
let bs = 0;
let beepEle = document.getElementById("metronome");
beepEle.onclick = function(event){
    if(!beep){
        beep = new Metronome.Metronome(120);
    }
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
//setInterval(function(){nt.instrumentNoteInput([8, [-1, -1, -1, 4, -1, 6], null])}, 1000);
nt.instrumentNoteInput([4, [-1, -1, -1, 4, -1, 6], null]);


function pad(num, size){ return ('000000000' + num).substr(-size); }

nt.on("noteclick", (section_idx, note_idx) => {
    document.getElementById("section-idx").innerText = pad(section_idx+1, 3) + ".";
})
import { SLTab } from "./SlimTabV2"
let nt = new SLTab();
let data: [number, number[], any][][] = [
    [// section
        [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
        [8, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [4, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [16, [-1, 5, 2, -1, -1, -1], null],
        [16, [-1, 5, 2, -1, -1, -1], null],
    ],
    [
        [16, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
        [16, [-1, 5, 2, -1, -1, -1], null],
        [4, [3, -1, -1, 4, -1, -1], null],
        [16, [-1, 5, 2, -1, -1, -1], null],
        [16, [-1, 5, 2, -1, -1, -1], null],
        [8, [-1, 5, 2, -1, -1, -1], null],
    ],
    [
        [4, [-1, -1, -1, -1, -1, -1], null],
        [4, [-1, -1, -1, -1, -1, -1], null],
    ],
    [
        [4, [-1, -1, -1, -1, -1, -1], null],
        [4, [-1, -1, -1, -1, -1, -1], null],
    ],
    [
        [4, [-1, -1, -1, -1, -1, -1], null],
        [4, [-1, -1, -1, -1, -1, -1], null],
    ],
    [
        [4, [-1, -1, -1, -1, -1, -1], null],
        [4, [-1, -1, -1, -1, -1, -1], null],
    ],
    [
        [4, [1, -1, -1, -1, -1, -1], null],
        [4, [-1, -1, -1, 4, -1, -1], null],
    ],
];
nt.setNoteData(data);
nt.render(document.body);
nt.render(document.body);
setInterval(function(){nt.addNote(-1,[16, [-1, -1, -1, 4, -1, 6], null],)}, 500);
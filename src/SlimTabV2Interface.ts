import { Note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
export interface Correction {
    (sltab: SLTab, addData: Note, startSection: number, startNode: number, userData?: string): void
}
export interface CaculatedNoteData {
    x: number;
    y: number;
    length: number;
    blocks: number[];
    tail: number[];
    section: number;
    note: number;
    hasSvg: boolean;
}

export interface MidiData {
    signal: boolean; // true for note on, false for note off
    channel: number;
    key: number;
    velocity: number;
    userData?: string;
}
import { note, section } from "./SlimTabV2Types"
export interface Correction {
    (allData: section[], addData: note, startSection: number, startNode: number): void
}
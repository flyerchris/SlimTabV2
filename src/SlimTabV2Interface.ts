import { note } from "./SlimTabV2Types"
import { SLTab } from "./SlimTabV2"
export interface Correction {
    (sltab: SLTab, addData: note, startSection: number, startNode: number): void
}
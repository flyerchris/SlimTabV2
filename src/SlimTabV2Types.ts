export type note = [number, number[], any];// [4, [3, -1, -1, 4, -1, -1], null],// note length, [block number, index is string number,], user data
export type section = note[];
export type svgNote = {element: HTMLElement, blockGroup: {word: HTMLElement, ellipse: HTMLElement}[], lineGroup: HTMLCollection}
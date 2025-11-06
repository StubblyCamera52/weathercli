import type { WeatherData } from "./weatherapi";

export type Matrix2DChar = Array<Array<string>>;
type oneOrZero = "1" | "0";

// regexp for matching open space: 0{4}(0|1){4}0{4}

// 11111
// 11111
// 11100
// 01100
// 00000

// 111111
// 111111
// 111000
// 011000
// 000000

export class RenderGrid {
  width: number;
  height: number;
  private grid: Array<Array<boolean>>; // true means something is there, false means free space
  gridRep!: string; // tsc being dum again

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({length: height}).map(() => Array.from({length: width}).fill(false)) as boolean[][];
    this.regenerateGridRep();
  }

  private regenerateGridRep() {
    this.gridRep = this.grid.flat().map((item) => {return item ? "1" : "0" as string}).reduce((prev, curr) => {return prev.concat(curr)}); // flattens array, and converts to a string of 1's and 0's (useful for finding space)
  }

  checkForOpenSpace(blockWidth: number, blockHeight: number): [number, number] | null {
    // 0{x}((0|1){gridw-x}0{x}){y-1}

    let amountOfNumbersBetweenNextRowMatch = this.width-blockWidth;
    let openSpaceExpr = new RegExp(`0{${blockWidth}}((0|1){${amountOfNumbersBetweenNextRowMatch}}0{${blockWidth}}){${blockHeight-1}}`); // matches to an open block;
    let openSpaceIdx = openSpaceExpr.exec(this.gridRep);

    if (openSpaceIdx) {
      return [openSpaceIdx.index % this.width, Math.trunc(openSpaceIdx.index / this.width)]; // converts index to grid cell coords
    } else {
      return null;
    }
  }

  addBlockToGrid(blockWidth: number, blockHeight: number, posX: number, posY: number): void {
    this.grid = this.grid.map((value, index) => {
      if (posY > index || posY+blockHeight <= index) return value; // if this is not the correct row, dont update
      return value.map((value2, index2) => {
        if (posX > index2 || posX+blockWidth <= index2) return value2; // if this is not the correct column, dont update
        return true;
      });
    });

    this.regenerateGridRep();
  }

  // same as above but sets to false instead of true
  removeBlockFromGrid(blockWidth: number, blockHeight: number, posX: number, posY: number): void {
    this.grid = this.grid.map((value, index) => {
      if (posY > index || posY+blockHeight <= index) return value; // if this is not the correct row, dont update
      return value.map((value2, index2) => {
        if (posX > index2 || posX+blockWidth <= index2) return value2; // if this is not the correct column, dont update
        return false;
      });
    });

    this.regenerateGridRep();
  }
}


/*

0[0000]0
0[0000]0
000000
000000


*/

export interface RenderBlock {
  title: string;
  gridWidth: number; // if 0 it will auto expand to max width
  gridHeight: number; // if 0 it will also auto expand to max width
  border: "none" | "dashed" | "solid";
  renderString: string; // long ass string of ANSI escape codes and stuff. requires cursor to be set to the top-left corner of the block before render
  updateRenderString: (width: number, height: number, posX: number, posY: number, data: WeatherData) => void;
};
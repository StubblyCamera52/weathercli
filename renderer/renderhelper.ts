import type { NumberLiteralType } from "typescript";
import type { Matrix2DChar } from "../types/block";

function generateBlankCharArray(width: number, height: number): Matrix2DChar {
  let output: Matrix2DChar = [];

  // initialize blank array with terminal width and height
  for (let row = 0; row < height; row++) {
    output.push([]);
    for (let col = 0; col < width; col++) {
      output[row]?.push(" ");
    }
  }

  return output;
}

function addSolidBorder(width: number, height: number, arr: Matrix2DChar) {
  arr[0] = "┌"
    .padEnd(width - 1, "─")
    .concat("┐")
    .split(""); // generates ┌───┐
  for (let i = 1; i < height - 1; i++) {
    // @ts-expect-error
    arr[i][0] = "│";
    // @ts-expect-error
    arr[i][arr[i].length - 1] = "│";
  }
  arr[height - 1] = "└"
    .padEnd(width - 1, "─")
    .concat("┘")
    .split(""); // generates └───┘
}

function reduceCharsToStrings(arr: Matrix2DChar): string[] {
  let output: string[] = [];

  for (const item of arr) {
    output.push(
      item.reduce((accumulated, current) => {
        return accumulated + current;
      }, "")
    );
  }

  return output;
}

function calcBlockDimensionsGivenGridSize(termSizeW: number, termSizeH: number, gridCellsW: number, gridCellsH: number, blockSizeW: number, blockSizeH: number): [number, number] {
  let calcW: number;
  let calcH: number;
  const ratioW = Math.floor(termSizeW/gridCellsW);
  const ratioH = Math.floor(termSizeH/gridCellsH);

  if (blockSizeW == 0) {
    calcW = termSizeW;
  } else {
    calcW = blockSizeW*ratioW;
  }

  calcH = blockSizeH*ratioH;

  return [calcW, calcH];
}

// ┌───┐
// │.  │
// └───┘

export { generateBlankCharArray, addSolidBorder, reduceCharsToStrings, calcBlockDimensionsGivenGridSize };
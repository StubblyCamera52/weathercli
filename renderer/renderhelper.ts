import type { Matrix2DChar } from "../types/block";

function generateBlankCharArray(width: number, height: number): Matrix2DChar {
  let output: Matrix2DChar = [];

  // initialize blank array with terminal width and height
  for (let row = 0; row < height; row++) {
    output.push([]);
    for (let col = 0; col < width; col++) {
      output[row]?.push(" ")
    }
  }

  return output;
}

function addSolidBorder(width: number, height: number, arr: Matrix2DChar) {
  arr[0] = "┌".padEnd(width-2).concat("┐").split(""); // generates ┌───┐
  for (let i = 1; i < height-1; i++) {
    // @ts-expect-error
    arr[i][0] = "│";
    // @ts-expect-error
    arr[i][arr[i].length-1] = "│";
  }
  arr[height-1] = "└".padEnd(width-2).concat("┘").split(""); // generates └───┘
}

// ┌───┐
// │.  │
// └───┘
import type { NumberLiteralType } from "typescript";
import type { Matrix2DChar } from "../types/block";

export const GRID_CELL_SIZE_X = 14;
export const GRID_CELL_SIZE_Y = 5;

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

function addSolidBorder(width: number, height: number, posX: number, posY: number, str: string): string {
  // console.log(width, height, posX, posY);
  let leftWallString = "\x1b[1B\x1b["+posX+"G│"; // prints │ down the left side;
  let rightWallString = "\x1b[1B\x1b["+(posX+width-1)+"G│"; // prints │ down the right side

  let borderGenString = "\x1b7\x1b["+posY+";"+posX+"f"; // save cursor position and move to top-left corner of block
  borderGenString = borderGenString.concat("┌","─".repeat(width-2),"┐"); // add ┌───┐ to string
  borderGenString = borderGenString.concat(leftWallString.repeat(height-2),"\x1b["+posY+";"+posX+"f", rightWallString.repeat(height-2));
  borderGenString = borderGenString.concat("\x1b["+(posY+height-1)+";"+posX+"f");
  borderGenString = borderGenString.concat("└","─".repeat(width-2),"┘");
  borderGenString = borderGenString.concat("\x1b8");

  return str.concat(borderGenString);
}

function reduceCharsToStrings(arr: Matrix2DChar): string {
  let output: string[] = [];

  for (const item of arr) {
    output.push(
      item.reduce((accumulated, current) => {
        return accumulated + current;
      }, "")
    );
  }

  let output2 = output.reduce((str1, str2) => {return str1.concat(str2)});

  return output2;
}

function reduceCharsToStrings2(arr: Matrix2DChar): string[] {
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
    calcW = blockSizeW*GRID_CELL_SIZE_X;
  }

  calcH = blockSizeH*GRID_CELL_SIZE_Y;

  //console.log(calcW, calcH);

  return [calcW, calcH];
}

function calculateIndividualSectionWidthAndXPosAndMidCol(totalWidth: number, numSections: number, blockX: number, sectionIndex: number): [number, number, number] { // width, xpos, midcol
  let sectionWidth = Math.floor(totalWidth/numSections);
  let xPos = blockX + sectionWidth*sectionIndex
  let midCol = xPos + (Math.floor(sectionWidth/2)-1);

  return [sectionWidth, xPos, midCol];
}

function generateMoveToCmd(col: number, row: number): string {
  return "\x1b["+row+";"+col+"f";
}

function calcMaxGridCellsXYFromTermSize(termWidth: number, termHeight: number): [number, number] {
  const maxCellsX = Math.floor(termWidth/GRID_CELL_SIZE_X);
  const maxCellsY = Math.floor(termHeight/GRID_CELL_SIZE_Y);

  return [maxCellsX, maxCellsY];
}

function generateClearBlockString(col1: number, row1: number, col2: number, row2: number): string {
  let outputString = generateMoveToCmd(col1, row1);

  for (let i = 0; i <= (row2-row1); i++) {
    outputString = outputString.concat(" ".repeat(1+col2-col1), generateMoveToCmd(col1, row1+i));
  }

  return outputString;
}

// ┌───┐
// │.  │
// └───┘

export {
  generateBlankCharArray, addSolidBorder, reduceCharsToStrings, calcBlockDimensionsGivenGridSize,
  calculateIndividualSectionWidthAndXPosAndMidCol, generateMoveToCmd, calcMaxGridCellsXYFromTermSize,
  generateClearBlockString
};
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

function addSolidBorder(width: number, height: number, posX: number, posY: number, str: string): string {
  let leftWallString = "\x1b[B\x1b["+posX+"G│"; // prints │ down the left side;
  let rightWallString = "\x1b[B\x1b["+(posX+width-1)+"G│"; // prints │ down the right side

  let borderGenString = "\x1b7\x1b["+posY+";"+posX+"f"; // save cursor position and move to top-left corner of block
  borderGenString = borderGenString.concat("┌","─".repeat(width-2),"┐"); // add ┌───┐ to string
  borderGenString = borderGenString.concat(leftWallString.repeat(height-2),"\x1b["+posY+";"+posX+"f", rightWallString.repeat(height-2));
  borderGenString = borderGenString.concat("\x1b["+(posY+height-2)+";"+posX+"f");
  borderGenString = borderGenString.concat("└","─".repeat(width-2),"┘");
  borderGenString = borderGenString.concat("\x1b8");

  return str.concat(borderGenString);
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
  const minCellSizeX = 14;
  const minCellSizeY = 5;

  const maxCellsX = Math.floor(termWidth/minCellSizeX);
  const maxCellsY = Math.floor(termHeight/minCellSizeY);

  return [maxCellsX, maxCellsY];
}

// ┌───┐
// │.  │
// └───┘

export {
  generateBlankCharArray, addSolidBorder, reduceCharsToStrings, calcBlockDimensionsGivenGridSize,
  calculateIndividualSectionWidthAndXPosAndMidCol, generateMoveToCmd, calcMaxGridCellsXYFromTermSize
};
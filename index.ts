import { parseOpenMeteoResponse } from "./data/parseApiResponse";
import { calcBlockDimensionsGivenGridSize, calcMaxGridCellsXYFromTermSize, GRID_CELL_SIZE_X, GRID_CELL_SIZE_Y, reduceCharsToStrings } from "./renderer/renderhelper";
import { CurrentConditions, CurrentWind, DailyOverview, HourlyTemperatureAndConditions, MoonPhases, OneByOneTestBlock, OneByThreeTestBlock, SunsetSunrise, TwoByOneTestBlock, TwoByTwoTestBlock } from "./renderer/weathermodules";
import { RenderGrid, type Matrix2DChar, type RenderBlock } from "./types/block";
import type { WeatherData } from "./types/weatherapi";
import { generateOutputArray } from "./utils/consolehelper";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let testApiData = await Bun.file("data/sampledata.json").text()
let testWeatherData = parseOpenMeteoResponse(testApiData);

let renderBlocks: RenderBlock[] = [
  new HourlyTemperatureAndConditions(),
  new CurrentConditions(),
  new CurrentWind(),
  new SunsetSunrise(),
  new DailyOverview(),
  new MoonPhases(),
].sort((a, b) => {
    let area1 = a.gridWidth * a.gridHeight;
    if (area1 == 0) return -1;
    let area2 = b.gridWidth * b.gridHeight;
    if (area2 == 0) return 1;

    return area2 - area1;
});

// gonna use a top-left decreasing algorithm for grid placement

let renderOrder: number[] = [];
let blocksToAnimate: number[] = [];

function updateBlockRenderStrings() {
  renderOrder = []; // list of renderblock indexes to render, in order;
  blocksToAnimate = [];

  [numColumns,numRows] = process.stdout.getWindowSize();
  
  let [gridCellsMX, gridCellsMY] = calcMaxGridCellsXYFromTermSize(numColumns, numRows);

  //console.log(gridCellsMX, gridCellsMY);

  let renderGrid = new RenderGrid(gridCellsMX, gridCellsMY);

  let blockPositions: Array<[number, number]> = []; // maps to render order

  for (let i = 0; i < renderBlocks.length; i++) {
    if (!renderBlocks[i]) continue;

    let itemWidth = renderBlocks[i]!.gridWidth;
    let itemHeight = renderBlocks[i]!.gridHeight; // this should not be undefined

    if (itemWidth == 0) itemWidth = gridCellsMX;
    if (itemHeight == 0) itemHeight = 1;

    let pos = renderGrid.checkForOpenSpace(itemWidth, itemHeight);
    if (!pos) continue;
    renderGrid.addBlockToGrid(itemWidth, itemHeight, pos[0], pos[1]);
    blockPositions.push(pos);
    renderOrder.push(i);
    if (renderBlocks[i]!.isAnimated) {
      blocksToAnimate.push(i);
    }
  }


  renderOrder.forEach((id, idx) => {
    if (renderBlocks[id]) {
      let block = renderBlocks[id];
      let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(numColumns, numRows, gridCellsMX, gridCellsMY, block.gridWidth, block.gridHeight);
      let [posX, posY] = [blockPositions[idx]![0]*GRID_CELL_SIZE_X+1, blockPositions[idx]![1]*GRID_CELL_SIZE_Y+1]; // +1 bc col and row start at 1,1

      block.updateRenderString(sizeW, sizeH, posX, posY, testWeatherData);
    }
  });

  //console.log(renderGrid.gridRep);
}

updateBlockRenderStrings();

console.write('\x1B[?25l'); // hides cursor
console.write('\x1B[H'); // sets cursor to home pos (0,0)

function render() {
  // console.write('\x1B[H');
  for (let idx of renderOrder) {
    if (renderBlocks[idx]) {
      console.write(renderBlocks[idx]?.renderString);
    }
  }
}

let frameCount = 0;
let last_time = performance.now();

function animationLoop() {
  frameCount++;
  blocksToAnimate.forEach((blockIdx) => {
    const current_time = performance.now();
    const dt = current_time-last_time;
    last_time = current_time;
    renderBlocks[blockIdx]!.animationUpdateFunc!(frameCount, dt/1000);
  });
}

render();

process.on("SIGWINCH", () => {
  console.clear();
  updateBlockRenderStrings();
  console.write('\x1B[H');
  render();
});

setInterval(() => {
  animationLoop();
}, 30);



//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
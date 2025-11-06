import { parseOpenMeteoResponse } from "./data/parseApiResponse";
import { calcBlockDimensionsGivenGridSize, calcMaxGridCellsXYFromTermSize, reduceCharsToStrings } from "./renderer/renderhelper";
import { CurrentConditions, HourlyTemperatureAndConditions } from "./renderer/weathermodules";
import type { Matrix2DChar, RenderBlock } from "./types/block";
import type { WeatherData } from "./types/weatherapi";
import { generateOutputArray } from "./utils/consolehelper";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let testApiData = await Bun.file("data/sampledata.json").text()
let testWeatherData = parseOpenMeteoResponse(testApiData);

let renderBlocks: RenderBlock[] = [
  new CurrentConditions(),
  new HourlyTemperatureAndConditions()
]

// gonna use a top-left decreasing algorithm for grid placement

let renderOrder: number[] = [...renderBlocks.keys()];

function updateBlockRenderStrings() {
  renderOrder = [...renderBlocks.keys()];

  [numColumns,numRows] = process.stdout.getWindowSize();
  
  let [gridCellsMX, gridCellsMY] = calcMaxGridCellsXYFromTermSize(numColumns, numRows);

  renderOrder.sort((a, b) => {
    // @ts-expect-error
    let area1 = renderBlocks[a].gridWidth * renderBlocks[a].gridHeight;
    if (area1 == 0) return 1;
    // @ts-expect-error
    let area2 = renderBlocks[b].gridWidth * renderBlocks[b].gridHeight;
    if (area2 == 0) return -1;

    return area1 - area2;
  }); // sort descending by area

  let blockPositions: Array<[number, number]> = []; // maps to render order


  

  for (let index of renderOrder) {
    if (!renderBlocks[index]) continue;

    let itemWidth = renderBlocks[index].gridWidth;
    let itemHeight = renderBlocks[index].gridHeight;


  }


  }

  // for (let block of renderBlocks) {
  //   let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(numColumns, numRows, gridCellsMX, gridCellsMY, block.gridWidth, block.gridHeight);



  //   block.updateRenderString(sizeW, sizeH, 1, 1, testWeatherData);
  // }
}

console.write('\x1B[?25l'); // hides cursor
console.write('\x1B[H'); // sets cursor to home pos (0,0)

// setInterval(() => {
//   render();
// }, 100);

function render() {
  // console.write('\x1B[H');
  for (let block of renderBlocks) {
    console.write(block.renderString);
  }
}

render();

process.on("SIGWINCH", () => {
  console.clear();
  for (let block of renderBlocks) {
    let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(process.stdout.columns, process.stdout.rows, 5, 4, block.gridWidth, block.gridHeight);
    block.updateRenderString(sizeW, sizeH, 1, 1, testWeatherData);
  }
  console.write('\x1B[H');
  render();
});



//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
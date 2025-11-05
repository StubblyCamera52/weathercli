import { parseOpenMeteoResponse } from "./data/parseApiResponse";
import { calcBlockDimensionsGivenGridSize, reduceCharsToStrings } from "./renderer/renderhelper";
import { HourlyTemperatureAndConditions } from "./renderer/weathermodules";
import type { Matrix2DChar, RenderBlock } from "./types/block";
import type { WeatherData } from "./types/weatherapi";
import { generateOutputArray } from "./utils/consolehelper";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let testApiData = await Bun.file("data/sampledata.json").text()
let testWeatherData = parseOpenMeteoResponse(testApiData);

let renderBlocks: RenderBlock[] = [
  new HourlyTemperatureAndConditions()
]

// grid of 5x5 cells for 100x40 console

for (let block of renderBlocks) {
  let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(process.stdout.columns, process.stdout.rows, 5, 2, block.gridWidth, block.gridHeight);

  block.updateRenderString(sizeW, sizeH, 1, 1, testWeatherData);
}

console.write('\x1B[?25l'); // hides cursor
console.write('\x1B[H'); // sets cursor to home pos (0,0)

setInterval(() => {
  render();
}, 100);

function render() {
  // console.write('\x1B[H');
  for (let block of renderBlocks) {
    console.write(block.renderString);
  }
}

process.on("SIGWINCH", () => {
  console.clear();
  for (let block of renderBlocks) {
    let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(process.stdout.columns, process.stdout.rows, 5, 5, block.gridWidth, block.gridHeight);
    block.updateRenderString(sizeW, sizeH, 1, 1, testWeatherData);
  }
});



//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
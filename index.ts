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

let renderedRenderBlocks: Matrix2DChar[] = []

// grid of 5x5 cells for 100x40 console

for (let block of renderBlocks) {
  let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(process.stdout.columns, process.stdout.rows, 5, 5, block.gridWidth, block.gridHeight);

  renderedRenderBlocks.push(block.render(sizeW, sizeH, testWeatherData));
}


console.write('\x1B[?25l'); // hides cursor
console.write('\x1B[H'); // sets cursor to home pos (0,0)

setInterval(() => {
  render();
}, 100);

function render() {
  let rendered: string[] = []
  for (let block of renderedRenderBlocks) {
    rendered = rendered.concat(reduceCharsToStrings(block));
  }
  //console.log(rendered);
  console.write('\x1B[H');
  for (let row of rendered) {
    console.write(row);
  }
}

process.on("SIGWINCH", () => {
  render();
});



//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
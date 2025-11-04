import { reduceCharsToStrings } from "./renderer/renderhelper";
import { HourlyTemperatureAndConditions } from "./renderer/weathermodules";
import { generateOutputArray } from "./utils/consolehelper";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let testApiData = await Bun.file("data/sampledata.json").text()

// numRows--;

let HourlyConditions = new HourlyTemperatureAndConditions();

let block1 = HourlyConditions.render(numColumns, numRows);

let rendered = reduceCharsToStrings(block1);

console.clear();
console.write('\x1B[?25l');

for (let row of rendered) {
  console.write(row);
}

process.on("SIGWINCH", () => {
  block1 = HourlyConditions.render(process.stdout.columns, process.stdout.rows);
  rendered = reduceCharsToStrings(block1);
  console.clear();
  for (let row of rendered) {
    console.write(row);
  }
})

//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
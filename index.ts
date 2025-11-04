import { generateOutputArray } from "./utils/consolehelper";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let testApiData = await Bun.file("data/sampledata.json").text()

// numRows--;

let rendered = generateOutputArray(numColumns, numRows);

console.clear();
console.write('\x1B[?25l');

for (let row of rendered) {
  console.write(row);
}

process.on("SIGWINCH", () => {
  rendered = generateOutputArray(process.stdout.columns, process.stdout.rows);
  console.clear();
  for (let row of rendered) {
    console.write(row);
  }
})

//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
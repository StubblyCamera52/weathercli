import { generateOutputArray } from "./utils/consolehelper";

const [col,row] = process.stdout.getWindowSize();
console.clear();

let rendered = generateOutputArray(col, row);

console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
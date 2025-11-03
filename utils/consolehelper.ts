

export function generateOutputArray(termWidth: number, termHeight: number): string[] {
  let output: Array<Array<string>> = [];

  // initialize blank array with terminal width and height
  for (let row = 0; row < termHeight; row++) {
    output.push([]);
    for (let col = 0; col < termWidth; col++) {
      output[row]?.push(" ")
    }
  }

  let finalRenderedOutput: string[] = [];

  for (const item of output) {
    finalRenderedOutput.push(item.reduce(reduceCharArrayToString, ""));
  }

  return finalRenderedOutput;
}

function reduceCharArrayToString(current: string, accumulated: string) {
  return accumulated + current;
}
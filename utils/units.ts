export function convertTemp(temp: number, uses_celcius: boolean): number {
  if (uses_celcius) {
    return temp;
  } else {
    return Math.round(temp*(9/5))+32; // convert c to f
  }
}
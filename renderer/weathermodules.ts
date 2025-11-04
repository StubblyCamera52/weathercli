import type { Matrix2DChar, RenderBlock } from "../types/block";
import type { WeatherData } from "../types/weatherapi";
import { addSolidBorder, generateBlankCharArray } from "./renderhelper";

export class HourlyTemperatureAndConditions implements RenderBlock {
    title = "Hourly Conditions";
    gridWidth = 0;
    gridHeight = 1;
    border = "solid" as "solid"; // bruh
    priority = 0;
    constructor() {};
    render = (width: number, height: number, data: WeatherData): Matrix2DChar => {
      let charArray = generateBlankCharArray(width, height);
      addSolidBorder(width, height, charArray);
      return charArray;
    };
}
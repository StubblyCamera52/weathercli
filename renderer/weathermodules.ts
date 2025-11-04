import type { Matrix2DChar, RenderBlock } from "../types/block";
import type { WeatherData } from "../types/weatherapi";

export class HourlyTemperatureAndConditions implements RenderBlock {
    title = "Hourly Conditions";
    gridWidth = 0;
    gridHeight = 1;
    border = "solid" as "solid"; // bruh
    constructor() {};
    renderFunc = (width: number, height: number, data: WeatherData): Matrix2DChar {
      
    };
}
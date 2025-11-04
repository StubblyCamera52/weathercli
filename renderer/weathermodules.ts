import type { Matrix2DChar, RenderBlock } from "../types/block";
import type { WeatherData } from "../types/weatherapi";
import { addSolidBorder, generateBlankCharArray } from "./renderhelper";

// wmo weather codes
// 0	Clear sky
// 1, 2, 3	Mainly clear, partly cloudy, and overcast
// 45, 48	Fog and depositing rime fog
// 51, 53, 55	Drizzle: Light, moderate, and dense intensity
// 56, 57	Freezing Drizzle: Light and dense intensity
// 61, 63, 65	Rain: Slight, moderate and heavy intensity
// 66, 67	Freezing Rain: Light and heavy intensity
// 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
// 77	Snow grains
// 80, 81, 82	Rain showers: Slight, moderate, and violent
// 85, 86	Snow showers slight and heavy
// 95 *	Thunderstorm: Slight or moderate
// 96, 99 *	Thunderstorm with slight and heavy hail

// ☀️🌤️⛅️☁️🌧️⛈️🌨️❄️🌫️🧊

function convertWMOCodeToString(code?: number): string {
  if (!code) {
    return "Unknown"
  }

  switch (code) {
    case 0: return "☀️ Clear";
    case 1: return "🌤️ Mostly Clear";
    case 2: return "⛅️ Partly Cloudy";
    case 3: return "☁️ Overcast";
    case 45:
    case 48: return "🌫️ Foggy";
    case 56:
    case 51: return "🌧️ Light Drizzle";
    case 53: return "🌧️ Moderate Drizzle";
    case 57:
    case 55: return "🌧️ Dense Drizzle";
    case 66:
    case 61: return "🌧️ Slight Rain";
    case 63: return "🌧️ Moderate Rain";
    case 67:
    case 65: return "🌧️ Heavy Rain";
    case 71: return "❄️ Slight Snow";
    case 73: return "❄️ Moderate Snow";
    case 75: return "❄️ Heavy Snow";
    case 77: return "❄️ Snow Grains";
    case 80: return "🌧️ Slight Showers";
    case 81: return "🌧️ Moderate Showers";
    case 82: return "🌧️ Violent Showers";
    case 85: return "❄️ Slight Snow Shower";
    case 86: return "❄️ Heavy Snow Shower";
    case 96:
    case 99:
    case 95: return "⛈️ Thunderstorm";
    default: return "Unknown";
  }
}

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

      let times = data.hourly?.time;
      let temps = data.hourly?.temperature;
      let conditions = data.hourly?.weatherCode;

      let conditionStrings: string[] = [];

      for 
      
      return charArray;
    };
}
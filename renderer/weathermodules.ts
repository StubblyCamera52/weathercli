import type { Matrix2DChar, RenderBlock } from "../types/block";
import type { WeatherData } from "../types/weatherapi";
import { addSolidBorder, calculateIndividualSectionWidthAndXPosAndMidCol, generateBlankCharArray, generateMoveToCmd } from "./renderhelper";

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


export class CurrentConditions implements RenderBlock {
  title = "Current Conditions";
  gridWidth = 0;
  gridHeight = 2;
  border = "none" as "none";
  renderString = "";
  constructor() {};
  updateRenderString = (width: number, height: number, posX: number, posY: number, data: WeatherData): void => {
    let midCol = posX+Math.floor(width/2)-1;
    let midRow = posY+Math.floor(height/2)-1;
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);
    let output_string = "";

    let temp = 0;
    let feels_like = 0;
    let is_day = 0;
    let WMOCode = -1;

    if (data.current?.weatherCode) {
      WMOCode = data.current.weatherCode;
    }

    let wmo_string = convertWMOCodeToString(WMOCode)

    if (data.current?.temperature) {
      temp = data.current.temperature;
    }

    if (data.current?.apparentTemperature) {
      feels_like = data.current.apparentTemperature;
    }

    if (data.current?.isDay) {
      is_day = data.current.isDay;
    }

    output_string = output_string.concat(moveToMidCmd, "\x1b[1D\x1b[2A", temp+"°C"); // renders temp
    output_string = output_string.concat(moveToMidCmd, "\x1b[1A\x1b[6D", "Feels like "+feels_like+"°C"); // feels like
    output_string = output_string.concat(moveToMidCmd, "\x1b["+Math.floor(wmo_string.length/2)+"D", wmo_string);

    if (is_day == 1) {
      output_string = output_string.concat(moveToMidCmd, "\x1b[1B", "☀️");
    } else {
      output_string = output_string.concat(moveToMidCmd, "\x1b[1B", "🌙");
    }

    this.renderString = output_string;

    return;
  };
}

/*

      100°C
⛅️ Partly Cloudy
       7pm


*/

export class HourlyTemperatureAndConditions implements RenderBlock {
    title = "Hourly Conditions";
    gridWidth = 0;
    gridHeight = 1;
    border = "solid" as "solid"; // bruh
    renderString = "";
    constructor() {};
    updateRenderString = (width: number, height: number, posX: number, posY: number, data: WeatherData): void => {
      let midCol = posX+Math.floor(width/2)-1;
      let midRow = posY+Math.floor(height/2)-1;
      let moveToMidCmd = generateMoveToCmd(midCol, midRow);
      let moveToCornerCmd = generateMoveToCmd(posX, posY);

      let output_string = "";
      output_string = addSolidBorder(width, height, posX, posY, output_string);

      let times = data.hourly?.time;
      let temps = data.hourly?.temperature;
      let conditions = data.hourly?.weatherCode;

      if (!times) {
        return;
      }

      let sectionWidth = width/6

      for (let i = 0; i < 6; i++) {
        let [sectionWidth, sectionPosX, sectionMidCol] = calculateIndividualSectionWidthAndXPosAndMidCol(width, 6, posX, i);
        let moveToMidCmd = generateMoveToCmd(sectionMidCol, midRow); // override movetomidcmd with the section middle

        if (!times || !temps || !conditions) break;
        let hour = new Date();
        hour.setHours(0);
        let temp = 0;
        let condition = -1;
        if (times[i]) {
          hour = new Date(times[i] as string); // ts type checker being dumb
        }
        if (temps[i]) {
          temp = temps[i] as number;
        }
        if (conditions[i]) {
          condition = conditions[i] as number;
        }

        let conditionString = convertWMOCodeToString(condition);

        //console.log(conditionString);

        //console.write(moveToMidCmd);

        let is_am_or_pm: string = "AM";
        if (hour.getHours() > 12) {
          is_am_or_pm = "PM";
        }

        output_string = output_string.concat(moveToMidCmd, "\x1b["+Math.floor(conditionString.length/2)+"D", conditionString);
        output_string = output_string.concat(moveToMidCmd, "\x1b[1D\x1b[1B", (hour.toLocaleTimeString(Intl.getCanonicalLocales("en-US")).split(":")[0] as string).concat(is_am_or_pm)); // makes it say the hour in 12hr time
        output_string = output_string.concat(moveToMidCmd, "\x1b[2D\x1b[1A", temp.toPrecision(2)+"°C");
      }

      this.renderString = output_string;
      
      return;
    };
}
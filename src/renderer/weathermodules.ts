
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

import type { RenderBlock } from "../types/block.js";
import type { WeatherData } from "../types/weatherapi.js";
import { calculateMoonPhase } from "../utils/astronomyhelper.js";
import type { Config } from "../utils/config.js";
import { convertTemp } from "../utils/units.js";
import { pointOnCircleFromAngleDegrees, SUNSET_SUNRISE_ART, MOON_ART } from "./asciiart.js";
import { generateBlankCharArray, reduceCharsToStrings, generateMoveToCmd, addSolidBorder, calculateIndividualSectionWidthAndXPosAndMidCol, generateClearBlockString } from "./renderhelper.js";

// ☀️🌤️⛅️☁️🌧️⛈️🌨️❄️🌫️🧊☼☃☁⛆⛈

function convertWMOCodeToString(code?: number): string {
  if (code == null) {
    return "Unknown"
  }

  switch (code) {
    case 0: return "☼ Clear";
    case 1: return "☼ Mostly Clear";
    case 2: return "☁ Partly Cloudy";
    case 3: return "☁ Overcast";
    case 45:
    case 48: return "░ Foggy";
    case 56:
    case 51: return "⛆ Light Drizzle";
    case 53: return "⛆ Moderate Drizzle";
    case 57:
    case 55: return "⛆ Dense Drizzle";
    case 66:
    case 61: return "⛆ Slight Rain";
    case 63: return "⛆ Moderate Rain";
    case 67:
    case 65: return "⛆ Heavy Rain";
    case 71: return "☃ Slight Snow";
    case 73: return "☃ Moderate Snow";
    case 75: return "☃ Heavy Snow";
    case 77: return "☃ Snow Grains";
    case 80: return "⛆ Slight Showers";
    case 81: return "⛆ Moderate Showers";
    case 82: return "⛆ Violent Showers";
    case 85: return "☃ Slight Snow Shower";
    case 86: return "☃ Heavy Snow Shower";
    case 96:
    case 99:
    case 95: return "⛈ Thunderstorm";
    default: return "? Unknown";
  }
}

function convertWMOCodeToIntensity(code: number) {
  if (code == null) {
    return 1;
  }

  switch (code) {
    case 0: return 1;
    case 1: return 1;
    case 2: return 1;
    case 3: return 1;
    case 45:
    case 48: return 1;
    case 56:
    case 51: return 1;
    case 53: return 2;
    case 57:
    case 55: return 3;
    case 66:
    case 61: return 1;
    case 63: return 2
    case 67:
    case 65: return 3;
    case 71: return 1;
    case 73: return 2;
    case 75: return 3;
    case 77: return 2;
    case 80: return 1;
    case 81: return 2;
    case 82: return 3;
    case 85: return 2;
    case 86: return 3;
    case 96:
    case 99:
    case 95: return 3;
    default: return 1;
  }
}


// rain, snow, ?hail?
type WeatherDrop = {
  x: number,
  y: number,
  speed: number,
  floating: boolean,
  character: string,
}

function generateSnow(width: number, height: number, count: number, minSpeed: number, maxSpeed: number, intensity: 1 | 2 | 3): WeatherDrop[] {
  let snow: WeatherDrop[] = [];

  for (let i = 0; i < count; i++) {
    let posx = Math.floor(Math.random()*width);
    let posy = Math.floor(Math.random()*height);
    let dropspeed = Math.floor(Math.random()*maxSpeed)+minSpeed;
    let character = [".", ",", "*"][intensity-1]!;
    snow.push({x: posx, y: posy, speed: dropspeed, character: character, floating: true});
  }

  return snow;
}

function generateRain(width: number, height: number, count: number, minSpeed: number, maxSpeed: number, intensity: 1 | 2 | 3): WeatherDrop[] {
  let rain: WeatherDrop[] = [];

  for (let i = 0; i < count; i++) {
    let posx = Math.floor(Math.random()*width);
    let posy = Math.floor(Math.random()*height);
    let dropspeed = Math.floor(Math.random()*maxSpeed)+minSpeed;
    let character = [".", ",", "|"][intensity-1]!;
    rain.push({x: posx, y: posy, speed: dropspeed, character: character, floating: false});
  }

  return rain;
}

function updateWeatherDrops(drops: WeatherDrop[], bottom: number, dt: number): WeatherDrop[] {
  let updatedDrops = drops;

  updatedDrops.forEach((drop, idx) => {
    drop.y += drop.speed*dt;
    if (drop.floating) {
      drop.x += Math.round((Math.random()*2)-1)
    }
    if (drop.y > bottom) {
      drop.y = 0;
    }
  });

  return updatedDrops;
}

export class CurrentConditions implements RenderBlock {
  title = "Current Conditions";
  gridWidth = 0;
  gridHeight = 2;
  border = "none" as "none";
  renderString = "";
  isAnimated = true;
  private width = 1;
  private height = 1;
  private weatherDrops: WeatherDrop[] = [];
  private wmocode = 0;
  private previous_wmo_code = 0;
  constructor() {};
  animationUpdateFunc(frameId: number, dt: number): void {
    let regenDrops = false;
    if (this.previous_wmo_code != this.wmocode) regenDrops = true;
    this.previous_wmo_code = this.wmocode;
    // its raining
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(this.wmocode)) {      
      this.weatherDrops = updateWeatherDrops(this.weatherDrops, this.height-1, dt);

      if (regenDrops) this.weatherDrops = generateRain(this.width, this.height-1, 50, 6, 10, convertWMOCodeToIntensity(this.wmocode));
      let renderArray = generateBlankCharArray(this.width, this.height-1);

      this.weatherDrops.forEach((drop, idx) => {
        renderArray[Math.floor(drop.y)]![drop.x] = drop.character;
      });

      let render = "\x1b[34m\x1b[H".concat(reduceCharsToStrings(renderArray));

      render = render.concat("\x1b[H\x1b[39m", this.renderString);

      process.stdout.write(render);

      // its snowing snow
    } else if ([71, 73, 75, 77, 85, 86].includes(this.wmocode)) {
      this.weatherDrops = updateWeatherDrops(this.weatherDrops, this.height-1, dt);

      if (regenDrops) this.weatherDrops = generateSnow(this.width, this.height-1, 50, 4, 7, convertWMOCodeToIntensity(this.wmocode));
      let renderArray = generateBlankCharArray(this.width, this.height-1);

      this.weatherDrops.forEach((drop, idx) => {
        renderArray[Math.floor(drop.y)]![drop.x] = drop.character;
      });

      let render = "\x1b[1;37m\x1b[H".concat(reduceCharsToStrings(renderArray));

      render = render.concat("\x1b[H\x1b[0;39m", this.renderString);

      process.stdout.write(render);
    } else {
      return;
    }
  }
  updateRenderString = (width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void => {
    let temp_unit_string = config.uses_celcius ? "°C" : "°F";

    let midCol = posX+Math.floor(width/2);
    let midRow = posY+Math.floor(height/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);
    let output_string = "";

    this.width = width;
    this.height = height;

    if (data.current?.time) {
      let current_time = new Date(data.current.time);
      output_string = output_string.concat(moveToCornerCmd, "\x1b[37m", "Forecast from: ", current_time.toTimeString(), "\x1b[39m");
    }

    let temp = 0;
    let feels_like = 0;
    let is_day = 0;
    let WMOCode = -1;

    if (data.current?.weatherCode != null) {
      WMOCode = data.current.weatherCode;
    }

    this.wmocode = WMOCode;
    this.previous_wmo_code = -1;

    let wmo_string = convertWMOCodeToString(WMOCode)

    if (data.current?.temperature) {
      temp = convertTemp(data.current.temperature, config.uses_celcius);
    }

    if (data.current?.apparentTemperature) {
      feels_like = convertTemp(data.current.apparentTemperature, config.uses_celcius);
    }

    if (data.current?.isDay) {
      is_day = data.current.isDay;
    }

    output_string = output_string.concat(moveToMidCmd, "\x1b[31m\x1b[1D\x1b[2A", temp+temp_unit_string, "\x1b[39m"); // renders temp
    output_string = output_string.concat(moveToMidCmd, "\x1b[36m\x1b[1A\x1b[6D", "Feels like "+feels_like+temp_unit_string, "\x1b[39m"); // feels like
    output_string = output_string.concat(moveToMidCmd, "\x1b[33m\x1b["+(Math.floor(wmo_string.length/2)-1)+"D", wmo_string, "\x1b[39m");

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
    isAnimated = false;
    constructor() {};
    updateRenderString = (width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void => {
      let temp_unit_string = config.uses_celcius ? "°C" : "°F";

      let midCol = posX+Math.floor(width/2);
      let midRow = posY+Math.floor(height/2);
      let moveToMidCmd = generateMoveToCmd(midCol, midRow);
      let moveToCornerCmd = generateMoveToCmd(posX, posY);

      let output_string = "";
      output_string = addSolidBorder(width, height, posX, posY, output_string);

      output_string = output_string.concat(generateMoveToCmd(posX+1, posY), this.title);

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
        if (conditions[i] != null) {
          condition = conditions[i] as number;
        }

        temp = convertTemp(temp, config.uses_celcius);

        let conditionString = convertWMOCodeToString(condition);

        //console.log(conditionString);

        //console.write(moveToMidCmd);

        let is_am_or_pm: string = "AM";
        if (hour.getHours() > 12) {
          is_am_or_pm = "PM";
        }

        output_string = output_string.concat(moveToMidCmd, "\x1b[32m\x1b["+Math.floor(conditionString.length/2)+"D", conditionString, "\x1b[0;39m");
        output_string = output_string.concat(moveToMidCmd, "\x1b[1;33m\x1b[1D\x1b[1B", (hour.toLocaleTimeString(Intl.getCanonicalLocales("en-US")).split(":")[0] as string).concat(is_am_or_pm), "\x1b[0;39m"); // makes it say the hour in 12hr time
        output_string = output_string.concat(moveToMidCmd, "\x1b[1;31m\x1b[2D\x1b[1A", temp.toPrecision(2)+temp_unit_string, "\x1b[0;39m");
      }

      this.renderString = output_string;
      
      return;
    };
}

export class CurrentWind implements RenderBlock {
  title = "Current Wind";
  gridWidth = 2;
  gridHeight = 2;
  border = "solid" as "solid";
  renderString = "";
  private blockCol = -1;
  private blockRow = -1;
  private blockWidth = -1;
  private blockHeight = -1;
  private windDirection = 0;
  isAnimated = true;
  constructor() {};
  animationUpdateFunc (frameId: number,  dt: number): void {
    let midCol = this.blockCol+Math.floor(this.blockWidth/2);
    let midRow = this.blockRow+Math.floor(this.blockHeight/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(this.blockCol, this.blockRow);

    this.windDirection = frameId%360;
    let outputString = generateClearBlockString(midCol-3, midRow-4, midCol+3, midRow+3);
    outputString = outputString.concat(generateClearBlockString(this.blockCol+1, this.blockRow+1, this.blockCol+5, this.blockRow+1));

    let [tipCol, tipRow] = pointOnCircleFromAngleDegrees(midCol, midRow, 3, this.windDirection);
    let [buttCol, buttRow] = pointOnCircleFromAngleDegrees(midCol, midRow, 3, (this.windDirection+180)%360);
    outputString = outputString.concat(generateMoveToCmd(midCol, midRow-1), "·");
    outputString = outputString.concat(generateMoveToCmd(tipCol, tipRow), "\x1b[1;31m", "*", "\x1b[1;34m", generateMoveToCmd(buttCol, buttRow), "■", "\x1b[0;39m");
    outputString = outputString.concat(generateMoveToCmd(this.blockCol+1, this.blockRow+1), this.windDirection.toString(), "°");

    process.stdout.write(outputString);
  }
  updateRenderString (width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void {
    this.blockCol = posX;
    this.blockRow = posY;
    this.blockHeight = height;
    this.blockWidth = width;

    let midCol = posX+Math.floor(width/2);
    let midRow = posY+Math.floor(height/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);

    let outputString = addSolidBorder(width, height, posX, posY, "");
    outputString = outputString.concat(generateMoveToCmd(posX+1, posY), this.title);
    if (data.current?.windDirection != null) {
      this.windDirection = data.current.windDirection;
      let [tipCol, tipRow] = pointOnCircleFromAngleDegrees(midCol, midRow, 3, this.windDirection);
      let [buttCol, buttRow] = pointOnCircleFromAngleDegrees(midCol, midRow, 3, (this.windDirection+180)%360);
      outputString = outputString.concat(generateMoveToCmd(midCol, midRow-1), "·");
      outputString = outputString.concat(generateMoveToCmd(tipCol, tipRow), "*", generateMoveToCmd(buttCol, buttRow), "■");
      outputString = outputString.concat(generateMoveToCmd(posX+1, posY+1), this.windDirection.toString(), "°");
    }

    if (data.current?.windSpeed != null) {
      outputString = outputString.concat(generateMoveToCmd(posX+1, posY+height-2), data.current.windSpeed.toString(), "kn")
    }

    if (data.current?.windGustSpeed != null) {
      outputString = outputString.concat(generateMoveToCmd(posX+width-("Gusts::kn".concat(data.current.windGustSpeed.toString()).length+1), posY+height-2), "Gusts: ", data.current.windGustSpeed.toString(), "kn")
    }

    this.renderString = outputString;
  }
}

export class SunsetSunrise implements RenderBlock {
  title = "Sun";
  gridWidth = 1;
  gridHeight = 1;
  border = "solid" as "solid"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString(width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void {
    let midCol = posX+Math.floor(width/2);
    let midRow = posY+Math.floor(height/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);

    let is_sunset = data.current?.isDay || 0; // if it is day we want to display sunset time else display sunrise time
    let current_date = new Date().toISOString().slice(0, 10)

    let sunsets = data.daily?.sunset || [];
    let sunrises = data.daily?.sunrise || [];
    let date_index = data.daily?.time?.indexOf(current_date) || -1;

    let outputString = addSolidBorder(width, height, posX, posY, "");

    if (date_index != -1) {
      if (is_sunset == 1) {
        let time = new Date(sunsets[date_index]!);
        outputString = outputString.concat(generateMoveToCmd(midCol-4, posY+height-1), time.toLocaleTimeString('en-US', {"hour": "2-digit", "minute": "2-digit"}));
      } else {
        let time = new Date(sunrises[date_index]!);
        outputString = outputString.concat(generateMoveToCmd(midCol-4, posY+height-1), time.toLocaleTimeString('en-US', {"hour": "2-digit", "minute": "2-digit"}));
      }
    }

    outputString = outputString.concat(generateMoveToCmd(posX+1, posY), this.title);

    outputString = outputString.concat(moveToMidCmd, is_sunset ? SUNSET_SUNRISE_ART.set : SUNSET_SUNRISE_ART.rise, "\x1b[0;39m");

    this.renderString = outputString;
  }
}

export class DailyOverview implements RenderBlock {
  title = "Today";
  gridWidth = 2;
  gridHeight = 2;
  border = "solid" as "solid"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString(width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void {
    let temp_unit_string = config.uses_celcius ? "°C" : "°F";

    let midCol = posX+Math.floor(width/2);
    let midRow = posY+Math.floor(height/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);
    let current_date = new Date().toISOString().slice(0, 10);
    let date_index = data.daily?.time?.indexOf(current_date) || -1;

    let outputString = addSolidBorder(width, height, posX, posY, "");

    outputString = outputString.concat(generateMoveToCmd(posX+1, posY), this.title);

    let precipitationSum = data.daily?.precipitation?.at(date_index) || 0;
    let precipitationProbability = data.daily?.precipitationProbability?.at(date_index) || 0;
    let temperatureMax = data.daily?.temperatureMax?.at(date_index) || 0;
    temperatureMax = convertTemp(temperatureMax, config.uses_celcius);
    let temperatureMin = data.daily?.temperatureMin?.at(date_index) || 0;
    temperatureMin = convertTemp(temperatureMin, config.uses_celcius);
    let weatherCode = data.daily?.weatherCode?.at(date_index) || -1;
    let weatherString = convertWMOCodeToString(weatherCode);

    outputString = outputString.concat(generateMoveToCmd(midCol-3, midRow-2),"💧", "\x1b[1;34m", precipitationSum.toString(), "mm", "\x1b[0;39m");
    outputString = outputString.concat(generateMoveToCmd(midCol-5, midRow-1), "\x1b[0;36m", precipitationProbability.toString(), "% Chance", "\x1b[0;39m");
    outputString = outputString.concat(generateMoveToCmd(midCol-(Math.floor(weatherString.length/2)), midRow), "\x1b[0;32m", weatherString, "\x1b[0;39m");
    outputString = outputString.concat(generateMoveToCmd(midCol-5, midRow+1), "\x1b[0;31m", temperatureMin.toString(), temp_unit_string, " - ", temperatureMax.toString(), temp_unit_string, "\x1b[0;39m");

    this.renderString = outputString;
  }
}

export class MoonPhases implements RenderBlock {
  title = "Moon";
  gridWidth = 1;
  gridHeight = 1;
  border = "none" as "none"; // bruh
  renderString = "";
  isAnimated = true;
  private phase = 0;
  private blockCol = -1;
  private blockRow = -1;
  private blockWidth = -1;
  private blockHeight = -1;
  constructor() {};
  animationUpdateFunc(frameId: number, dt: number): void {
    let midCol = this.blockCol+Math.floor(this.blockWidth/2);
    let midRow = this.blockRow+Math.floor(this.blockHeight/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(this.blockCol, this.blockRow);

    let outputString = generateClearBlockString(this.blockCol, this.blockRow, this.blockCol+this.blockWidth-1, this.blockRow+this.blockWidth-1);

    this.phase = Math.floor(frameId/10)%8;

    outputString = outputString.concat(moveToMidCmd, "\x1b[0;33m", MOON_ART[this.phase]!, "\x1b[0;39m");
    outputString = outputString.concat(generateMoveToCmd(this.blockCol+1, this.blockRow), this.title);

    process.stdout.write(outputString);
  }
  updateRenderString(width: number, height: number, posX: number, posY: number, data: WeatherData, config: Config): void {
    this.blockCol = posX;
    this.blockRow = posY;
    this.blockHeight = height;
    this.blockWidth = width;

    let midCol = posX+Math.floor(width/2);
    let midRow = posY+Math.floor(height/2);
    let moveToMidCmd = generateMoveToCmd(midCol, midRow);
    let moveToCornerCmd = generateMoveToCmd(posX, posY);

    let outputString = "";

    outputString = outputString.concat(generateMoveToCmd(posX+1, posY), this.title);

    let moonPhase = calculateMoonPhase();

    outputString = outputString.concat(moveToMidCmd, "\x1b[0;33m", MOON_ART[moonPhase]!, "\x1b[0;39m");

    this.renderString = outputString;
  }
}


export class TwoByTwoTestBlock implements RenderBlock {
  title = "TwoByTwoTest";
  gridWidth = 2;
  gridHeight = 2;
  border = "none" as "none"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString (width: number, height: number, posX: number, posY: number, data: WeatherData): void {
    this.renderString = addSolidBorder(width, height, posX, posY, "");
  }
}

export class OneByOneTestBlock implements RenderBlock {
  title = "OneByOneTest";
  gridWidth = 1;
  gridHeight = 1;
  border = "none" as "none"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString (width: number, height: number, posX: number, posY: number, data: WeatherData): void {
    this.renderString = addSolidBorder(width, height, posX, posY, "");
  }
}

export class TwoByOneTestBlock implements RenderBlock {
  title = "TwoByOneTest";
  gridWidth = 2;
  gridHeight = 1;
  border = "none" as "none"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString (width: number, height: number, posX: number, posY: number, data: WeatherData): void {
    this.renderString = addSolidBorder(width, height, posX, posY, "");
  }
}

export class OneByThreeTestBlock implements RenderBlock {
  title = "OneByThreeTest";
  gridWidth = 1;
  gridHeight = 3;
  border = "none" as "none"; // bruh
  renderString = "";
  isAnimated = false;
  constructor() {};
  updateRenderString (width: number, height: number, posX: number, posY: number, data: WeatherData): void {
    this.renderString = addSolidBorder(width, height, posX, posY, "");
  }
}
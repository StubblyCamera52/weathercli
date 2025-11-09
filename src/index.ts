#!/usr/bin/env node

import { OnboardingUI } from "./app/onboarding.js";
import { parseOpenMeteoResponse } from "./data/parseApiResponse.js";
import { calcMaxGridCellsXYFromTermSize, calcBlockDimensionsGivenGridSize, GRID_CELL_SIZE_X, GRID_CELL_SIZE_Y } from "./renderer/renderhelper.js";
import { HourlyTemperatureAndConditions, CurrentConditions, CurrentWind, SunsetSunrise, DailyOverview, MoonPhases } from "./renderer/weathermodules.js";
import { type RenderBlock, RenderGrid } from "./types/block.js";
import { loadConfig, loadCachedWeatherData, cacheWeatherData } from "./utils/config.js";
import fs from "node:fs";
import fetch from "node-fetch";
import type { WeatherData } from "./types/weatherapi.js";

let [numColumns,numRows] = process.stdout.getWindowSize();
console.clear();

let config = loadConfig();

if (process.argv.includes("-s")) {
  config = undefined;
}

if (!config) {
  await new Promise<void>((resolve, reject) => {
    const onboard = new OnboardingUI();
    onboard.once("complete", resolve);
    onboard.once("error", reject);
    onboard.start();
  });
  console.clear();
}

config = loadConfig() || {lat: 0, long: 0, uses_celcius: true};
let cachedData = loadCachedWeatherData()

let weatherData = {} as WeatherData;

let requestUrl = "https://api.open-meteo.com/v1/forecast?latitude="+config.lat.toFixed(5)+"&longitude="+config.long.toFixed(5)+"&daily=weather_code,sunset,sunrise,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_mean&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&timezone=auto&wind_speed_unit=kn&forecast_hours=12"

if (cachedData && cachedData.current?.time) {
  const cachedTime = new Date(cachedData.current.time);
  const nowTime = new Date();
  const timeDifference = Math.abs(nowTime.getTime() - cachedTime.getTime());
  if (timeDifference >= (1000*60*15) || Math.abs(config.lat - cachedData.latitude) > 0.5 || Math.abs(config.long - cachedData.longitude) > 0.5) { // 1000ms/s * 60s/min * 15min = update every 15 minutes. also update if user changes their latitude by a significant amount
    const response = await fetch(requestUrl);
    const data = await response.text();
    weatherData = parseOpenMeteoResponse(data);
    cacheWeatherData(weatherData);
  } else {
    weatherData = cachedData;
  }
} else {
  const response = await fetch(requestUrl);
  const data = await response.text();
  weatherData = parseOpenMeteoResponse(data);
  cacheWeatherData(weatherData);
}

let renderBlocks: RenderBlock[] = [
  new HourlyTemperatureAndConditions(),
  new CurrentConditions(),
  new CurrentWind(),
  new SunsetSunrise(),
  new DailyOverview(),
  new MoonPhases(),
].sort((a, b) => {
    let area1 = a.gridWidth * a.gridHeight;
    if (area1 == 0) return -1;
    let area2 = b.gridWidth * b.gridHeight;
    if (area2 == 0) return 1;

    return area2 - area1;
});

// gonna use a top-left decreasing algorithm for grid placement

let renderOrder: number[] = [];
let blocksToAnimate: number[] = [];

function updateBlockRenderStrings() {
  renderOrder = []; // list of renderblock indexes to render, in order;
  blocksToAnimate = [];

  [numColumns,numRows] = process.stdout.getWindowSize();
  
  let [gridCellsMX, gridCellsMY] = calcMaxGridCellsXYFromTermSize(numColumns, numRows);

  //console.log(gridCellsMX, gridCellsMY);

  let renderGrid = new RenderGrid(gridCellsMX, gridCellsMY);

  let blockPositions: Array<[number, number]> = []; // maps to render order

  for (let i = 0; i < renderBlocks.length; i++) {
    if (!renderBlocks[i]) continue;

    let itemWidth = renderBlocks[i]!.gridWidth;
    let itemHeight = renderBlocks[i]!.gridHeight; // this should not be undefined

    if (itemWidth == 0) itemWidth = gridCellsMX;
    if (itemHeight == 0) itemHeight = 1;

    let pos = renderGrid.checkForOpenSpace(itemWidth, itemHeight);
    if (!pos) continue;
    renderGrid.addBlockToGrid(itemWidth, itemHeight, pos[0], pos[1]);
    blockPositions.push(pos);
    renderOrder.push(i);
    if (renderBlocks[i]!.isAnimated) {
      blocksToAnimate.push(i);
    }
  }


  renderOrder.forEach((id, idx) => {
    if (renderBlocks[id]) {
      let block = renderBlocks[id];
      let [sizeW, sizeH] = calcBlockDimensionsGivenGridSize(numColumns, numRows, gridCellsMX, gridCellsMY, block.gridWidth, block.gridHeight);
      let [posX, posY] = [blockPositions[idx]![0]*GRID_CELL_SIZE_X+1, blockPositions[idx]![1]*GRID_CELL_SIZE_Y+1]; // +1 bc col and row start at 1,1

      block.updateRenderString(sizeW, sizeH, posX, posY, weatherData, config!);
    }
  });

  //console.log(renderGrid.gridRep);
}

updateBlockRenderStrings();

process.stdout.write('\x1B[?25l'); // hides cursor
process.stdout.write('\x1B[H'); // sets cursor to home pos (0,0)

function render() {
  // console.write('\x1B[H');
  for (let idx of renderOrder) {
    if (renderBlocks[idx]) {
      process.stdout.write(renderBlocks[idx]?.renderString);
    }
  }
}

let frameCount = 0;
let last_time = performance.now();

function animationLoop() {
  frameCount++;
  blocksToAnimate.forEach((blockIdx) => {
    const current_time = performance.now();
    const dt = current_time-last_time;
    last_time = current_time;
    renderBlocks[blockIdx]!.animationUpdateFunc!(frameCount, dt/1000);
  });
}

render();

process.on("SIGWINCH", () => {
  console.clear();
  updateBlockRenderStrings();
  process.stdout.write('\x1B[H');
  render();
});

setInterval(() => {
  animationLoop();
}, 100);



//console.log(`dimensions: ${col} cols x ${row} rows`);
await new Promise(resolve => process.stdin.once('data', resolve));
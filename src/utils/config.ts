import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import type { WeatherData } from "../types/weatherapi.js";

export type Config = {
  lat: number;
  long: number;
  uses_celcius: boolean;
}

const configDir = path.join(os.homedir(), ".weathercli");
const configFile = path.join(configDir, "config.json");
const cacheFile = path.join(configDir, "cache.json");

export function saveConfig(config: Config) {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, {recursive: true});
  }

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

export function loadConfig(): Config | undefined {
  if (fs.existsSync(configFile)) {
    const configData = fs.readFileSync(configFile, 'utf-8');
    return JSON.parse(configData);
  } else {
    return;
  }
}

export function cacheWeatherData(data: WeatherData): void {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, {recursive: true});
  }

  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
}

export function loadCachedWeatherData(): WeatherData | undefined {
  if (fs.existsSync(cacheFile)) {
    const cachedData = fs.readFileSync(cacheFile, 'utf-8');
    return JSON.parse(cachedData);
  } else {
    return;
  }
}
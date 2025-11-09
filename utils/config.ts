import os from "node:os";
import fs from "node:fs";
import path from "node:path";

export type Config = {
  lat: number;
  long: number;
  uses_celcius: boolean;
}

const configDir = path.join(os.homedir(), ".weathercli");
const configFile = path.join(configDir, "config.json");

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
import type { WeatherData } from "./weatherapi";

export interface block {
  title: string;
  width: number; // if 0 it will auto expand to max width
  height: number; // if 0 it will also auto expand to max width
  border: "none" | "dashed";
  renderFunc: (width: number, height: number, data: WeatherData) => Array<Array<string>>;
};
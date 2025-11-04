import type { WeatherData } from "./weatherapi";

export type Matrix2DChar = Array<Array<string>>;

export interface RenderBlock {
  title: string;
  gridWidth: number; // if 0 it will auto expand to max width
  gridHeight: number; // if 0 it will also auto expand to max width
  border: "none" | "dashed" | "solid";
  render: (width: number, height: number, data: WeatherData) => Matrix2DChar;
};
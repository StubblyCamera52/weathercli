import type { WeatherData } from "./weatherapi";

export type Matrix2DChar = Array<Array<string>>;

export interface RenderBlock {
  title: string;
  priority: number; // lower number is higher priority; 0 is maximum
  gridWidth: number; // if 0 it will auto expand to max width
  gridHeight: number; // if 0 it will also auto expand to max width
  border: "none" | "dashed" | "solid";
  renderString: string; // long ass string of ANSI escape codes and stuff. requires cursor to be set to the top-left corner of the block before render
  updateRenderString: (width: number, height: number, posX: number, posY: number, data: WeatherData) => void;
};
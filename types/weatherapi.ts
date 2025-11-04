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

// https://open-meteo.com/en/docs

export type WeatherData = {
  latitude: number;
  longitude: number;
  timezoneOffset: number; // seconds
  timezone: string;
  elevation: number;
  current?: WeatherTimeMomentData;
  hourly?: WeatherTimeRangeData;
  daily?: WeatherTimeRangeData;
}

export type WeatherTimeMomentData = {
  time?: string;
  interval?: number;
  temperature?: number;
  apparentTemperature?: number;
  precipitation?: number;
  precipitationProbability?: number;
  weatherCode?: number;
  windSpeed?: number;
  windDirection?: number;
  windGustSpeed?: number;
}

export type WeatherTimeRangeData = {
  time?: string[];
  temperature?: number[];
  apparentTemperature?: number[];
  temperatureMax?: number[];
  temperatureMin?: number[];
  precipitation?: number[];
  precipitationProbability?: number[];
  weatherCode?: number[];
  windSpeed?: number[];
  windDirection?: number[];
  windGustSpeed?: number[];
  sunrise?: string[];
  sunset?: string[];
}

type WeatherUnits = {
  time: "iso8601";
  temperature: "fahrenheit" | "celcius";
  temperatureMax: "fahrenheit" | "celcius";
  temperatureMin: "fahrenheit" | "celcius";
  precipitation: "mm" | "in";
  sunrise: "iso8601";
  sunset: "iso8601";
  precipitation_prob: "%";
  weatherCode: "wmo code";
  windSpeed: "kn" | "mph" | "km/h" | "m/s";
  windDirection: "degrees";
}
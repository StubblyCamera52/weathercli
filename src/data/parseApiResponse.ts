import type { WeatherData, WeatherTimeMomentData, WeatherTimeRangeData } from "../types/weatherapi";

type OpenMeteoApiResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    dew_point_2m: string;
    apparent_temperature: string;
    shortwave_radiation: string;
    direct_radiation: string;
    direct_normal_irradiance: string;
    global_tilted_irradiance: string;
    global_tilted_irradiance_instant: string;
    diffuse_radiation: string;
    sunshine_duration: string;
    lightning_potential: string;
    precipitation: string;
    snowfall: string;
    rain: string;
    showers: string;
    snowfall_height: string;
    freezing_level_height: string;
    cape: string;
    wind_speed_10m: string;
    wind_speed_80m: string;
    wind_direction_10m: string;
    wind_direction_80m: string;
    wind_gusts_10m: string;
    visibility: string;
    weather_code: string;
  };
  current: {
    time: string;
    is_day: number;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    dew_point_2m: number;
    apparent_temperature: number;
    shortwave_radiation: number;
    direct_radiation: number;
    direct_normal_irradiance: number;
    global_tilted_irradiance: number;
    global_tilted_irradiance_instant: number;
    diffuse_radiation: number;
    sunshine_duration: number;
    lightning_potential: number;
    precipitation: number;
    snowfall: number;
    rain: number;
    showers: number;
    snowfall_height: number;
    freezing_level_height: number;
    cape: number;
    wind_speed_10m: number;
    wind_speed_80m: number;
    wind_direction_10m: number;
    wind_direction_80m: number;
    wind_gusts_10m: number;
    visibility: number;
    weather_code: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    dew_point_2m: string;
    apparent_temperature: string;
    pressure_msl_surface_pressure: string;
    cloud_cover: string;
    cloud_cover_low: string;
    cloud_cover_mid: string;
    cloud_cover_high: string;
    wind_speed_10m: string;
    wind_speed_80m: string;
    wind_speed_120m: string;
    wind_speed_180m: string;
    wind_direction_10m: string;
    wind_direction_80m: string;
    wind_direction_120m: string;
    wind_direction_180m: string;
    wind_gusts_10m: string;
    shortwave_radiation: string;
    direct_radiation: string;
    direct_normal_irradiance: string;
    diffuse_radiation: string;
    global_tilted_irradiance: string;
    vapour_pressure_deficit: string;
    cape: string;
    evapotranspiration: string;
    et0_fao_evapotranspiration: string;
    precipitation: string;
    snowfall: string;
    precipitation_probability: string;
    rain: string;
    showers: string;
    weather_code: string;
    snow_depth: string;
    freezing_level_height: string;
    visibility: string;
    soil_temperature_0cm: string;
    soil_temperature_6cm: string;
    soil_temperature_18cm: string;
    soil_temperature_54cm: string;
    soil_moisture_0_to_1cm: string;
    soil_moisture_1_to_3cm: string;
    soil_moisture_3_to_9cm: string;
    soil_moisture_9_to_27cm: string;
    soil_moisture_27_to_81cm: string;
    is_day: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    apparent_temperature: number[];
    pressure_msl_surface_pressure: number[];
    cloud_cover: number[];
    cloud_cover_low: number[];
    cloud_cover_mid: number[];
    cloud_cover_high: number[];
    wind_speed_10m: number[];
    wind_speed_80m: number[];
    wind_speed_120m: number[];
    wind_speed_180m: number[];
    wind_direction_10m: number[];
    wind_direction_80m: number[];
    wind_direction_120m: number[];
    wind_direction_180m: number[];
    wind_gusts_10m: number[];
    shortwave_radiation: number[];
    direct_radiation: number[];
    direct_normal_irradiance: number[];
    diffuse_radiation: number[];
    global_tilted_irradiance: number[];
    vapour_pressure_deficit: number[];
    cape: number[];
    evapotranspiration: number[];
    et0_fao_evapotranspiration: number[];
    precipitation: number[];
    snowfall: number[];
    precipitation_probability: number[];
    rain: number[];
    showers: number[];
    weather_code: number[];
    snow_depth: number[];
    freezing_level_height: number[];
    visibility: number[];
    soil_temperature_0cm: number[];
    soil_temperature_6cm: number[];
    soil_temperature_18cm: number[];
    soil_temperature_54cm: number[];
    soil_moisture_0_to_1cm: number[];
    soil_moisture_1_to_3cm: number[];
    soil_moisture_3_to_9cm: number[];
    soil_moisture_9_to_27cm: number[];
    soil_moisture_27_to_81cm: number[];
    is_day: number[];
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_mean: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_mean: string;
    apparent_temperature_min: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    precipitation_probability_mean: string;
    precipitation_probability_min: string;
    weather_code: string;
    sunrise: string;
    sunset: string;
    sunshine_duration: string;
    daylight_duration: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
    shortwave_radiation_sum: string;
    et0_fao_evapotranspiration: string;
    uv_index_max: string;
    uv_index_clear_sky_max: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_mean: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_mean: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    precipitation_probability_mean: number[];
    precipitation_probability_min: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
    sunshine_duration: number[];
    daylight_duration: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
    et0_fao_evapotranspiration: number[];
    uv_index_max: number[];
    uv_index_clear_sky_max: number[];
  };
}

export function parseOpenMeteoResponse(response: string): WeatherData {
  const responseObject: OpenMeteoApiResponse = JSON.parse(response);

  let parsedWeatherData: WeatherData = {
    "latitude": responseObject.latitude,
    "longitude": responseObject.longitude,
    "timezone": responseObject.timezone,
    "timezoneOffset": responseObject.utc_offset_seconds,
    "elevation": responseObject.elevation
  };

  let parsedHourlyData: WeatherTimeRangeData = {
    "time": responseObject.hourly.time,
    "temperature": responseObject.hourly.temperature_2m,
    "weatherCode": responseObject.hourly.weather_code,
  };

  let parsedDailyData: WeatherTimeRangeData = {
    "time": responseObject.daily.time,
    "sunset": responseObject.daily.sunset,
    "sunrise": responseObject.daily.sunrise,
    "temperatureMax": responseObject.daily.temperature_2m_max,
    "temperatureMin": responseObject.daily.temperature_2m_min,
    "precipitation": responseObject.daily.precipitation_sum,
    "precipitationProbability": responseObject.daily.precipitation_probability_mean,
    "weatherCode": responseObject.daily.weather_code,
  }

  let parsedCurrentData: WeatherTimeMomentData = {
    "time": responseObject.current.time,
    "apparentTemperature": responseObject.current.apparent_temperature,
    "temperature": responseObject.current.temperature_2m,
    "isDay": responseObject.current.is_day,
    "weatherCode": responseObject.current.weather_code,
    "windDirection": responseObject.current.wind_direction_10m,
    "windGustSpeed": responseObject.current.wind_gusts_10m,
    "windSpeed": responseObject.current.wind_speed_10m
  }

  parsedWeatherData.hourly = parsedHourlyData;
  parsedWeatherData.current = parsedCurrentData;
  parsedWeatherData.daily = parsedDailyData;

  return parsedWeatherData;
}
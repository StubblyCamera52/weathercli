import Decimal from "decimal.js";

// 0: "New Moon", 
// 1: "Waxing Crescent", 
// 2: "First Quarter", 
// 3: "Waxing Gibbous", 
// 4: "Full Moon", 
// 5: "Waning Gibbous", 
// 6: "Last Quarter", 
// 7: "Waning Crescent"


// Adapted From https://gist.github.com/miklb/ed145757971096565723
// moonphase.py - Calculate Lunar Phase
// Author: Sean B. Palmer, inamidst.com
// Cf. http://en.wikipedia.org/wiki/Lunar_phase#Lunar_phase_calculation


export const moon_phases = {
  0: "New Moon",
  1: "Waxing Crescent",
  2: "First Quarter",
  3: "Waxing Gibbous",
  4: "Full Moon",
  5: "Waning Gibbous",
  6: "Last Quarter",
  7: "Waning Crescent"
}

export function calculateMoonPhase(date?: Date): number {
  let now = date || new Date();
  let prior_new_moon_date = new Date(2025, 9, 21);
  let diff = now.getTime() - prior_new_moon_date.getTime();
  let days = new Decimal(diff).div(1000*60*60*24); // ms/sec * s/min * min/hr * hr/day
  let lunations = new Decimal("0").add(days.mul(new Decimal("0.03386319269")));
  let index = lunations.mod(1).mul(new Decimal("8")).add(new Decimal("0.5"));
  index = index.floor();

  return index.mod(8).toNumber();
}
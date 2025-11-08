export const WIND_ART = {
  0: " /\\\x1b[1B\x1b[3D/||\\\x1b[1B\x1b[3D||\x1b[1B\x1b[2D||", // renders an up arrow (these are a nightmare to create)
}

export function pointOnCircleFromAngleDegrees(midCol: number, midRow: number, radius: number, angle: number): [number, number] {
  let roundedAngle = Math.round((angle/360)*24)*15; // round to 15 degree increments
  roundedAngle = roundedAngle * (Math.PI/180)
  let [pointX, pointY] = [Math.round(Math.sin(roundedAngle)*radius), -Math.round(Math.cos(roundedAngle)*radius)];
  return [pointX+midCol, pointY+midRow-1];
}

// `

//  /\
// /||\
//  ||
//  ||


// __.
//  /|
// `

/*

↖ ↑ ↗
← · →
↙ ↓ ↘

*/
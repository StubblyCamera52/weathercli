export function pointOnCircleFromAngleDegrees(midCol: number, midRow: number, radius: number, angle: number): [number, number] {
  let roundedAngle = Math.round((angle/360)*24)*15; // round to 15 degree increments
  roundedAngle = roundedAngle * (Math.PI/180)
  let [pointX, pointY] = [Math.round(Math.sin(roundedAngle)*radius), -Math.round(Math.cos(roundedAngle)*radius)];
  return [pointX+midCol, pointY+midRow-1];
}

export const SUNSET_SUNRISE_ART = {
  "set": "\x1b[3D(---)\x1b[3D\x1b[1A↓\x1b[2B\x1b[5D``````````",
  "rise": "\x1b[3D(OOO)\x1b[3D\x1b[1A↑\x1b[2B\x1b[5D``````````",
}

//      ↓
//    (---)
// ``````````

//      ↑
//    (OOO)
// ``````````

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
export function pointOnCircleFromAngleDegrees(midCol: number, midRow: number, radius: number, angle: number): [number, number] {
  let roundedAngle = Math.round((angle/360)*24)*15; // round to 15 degree increments
  roundedAngle = roundedAngle * (Math.PI/180)
  let [pointX, pointY] = [Math.round(Math.sin(roundedAngle)*radius), -Math.round(Math.cos(roundedAngle)*radius)];
  return [pointX+midCol, pointY+midRow-1];
}

export const SUNSET_SUNRISE_ART = {
  "set": "\x1b[0;33m\x1b[3D(---)\x1b[3D\x1b[1A\x1b[0;39m↓\x1b[2B\x1b[5D\x1b[0;36m``````````",
  "rise": "\x1b[1;33m\x1b[3D(OOO)\x1b[3D\x1b[1A\x1b[0;39m↑\x1b[2B\x1b[5D\x1b[0;36m``````````",
}

export const MOON_ART: { [key: number]: string } = {
  0: "\x1b[1A\x1b[4D/.......\\\x1b[10D\x1b[1B|.........|\x1b[11D\x1b[1B|.........|\x1b[10D\x1b[1B\\......./",
  1: "\x1b[1A\x1b[4D/.....OO\\\x1b[10D\x1b[1B|.......OO|\x1b[11D\x1b[1B|.......OO|\x1b[10D\x1b[1B\\.....OO/",
  2: "\x1b[1A\x1b[4D/...OOOO\\\x1b[10D\x1b[1B|....OOOOO|\x1b[11D\x1b[1B|....OOOOO|\x1b[10D\x1b[1B\\...OOOO/",
  3: "\x1b[1A\x1b[4D/..OOOOO\\\x1b[10D\x1b[1B|..OOOOOOO|\x1b[11D\x1b[1B|..OOOOOOO|\x1b[10D\x1b[1B\\..OOOOO/",
  4: "\x1b[1A\x1b[4D/OOOOOOO\\\x1b[10D\x1b[1B|OOOOOOOOO|\x1b[11D\x1b[1B|OOOOOOOOO|\x1b[10D\x1b[1B\\OOOOOOO/",
  5: "\x1b[1A\x1b[4D/OOOOO..\\\x1b[10D\x1b[1B|OOOOOOO..|\x1b[11D\x1b[1B|OOOOOOO..|\x1b[10D\x1b[1B\\OOOOO../",
  6: "\x1b[1A\x1b[4D/OOOO...\\\x1b[10D\x1b[1B|OOOOO....|\x1b[11D\x1b[1B|OOOOO....|\x1b[10D\x1b[1B\\OOOO.../",
  7: "\x1b[1A\x1b[4D/OO.....\\\x1b[10D\x1b[1B|OO.......|\x1b[11D\x1b[1B|OO.......|\x1b[10D\x1b[1B\\OO...../"
}


/*
  ;;;;;;
;;;;;;;;;;
;;;;;;;;;;
  ;;;;;;

*/

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
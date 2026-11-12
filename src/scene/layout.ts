// Machine dimensions in decimetres (1 unit = 10 cm). x: right, y: up, z: toward the operator.
export type Vec3 = [number, number, number];

export const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML']; // original Enigma layout
export const CASE = { w: 3.4, d: 2.8, h: 1.05, wall: 0.07 };
export const PLATE_Y = 0.86;

function grid(rowCoord: (r: number) => Partial<{ y: number; z: number }>, base: Vec3, spacing: number) {
  const out: Vec3[] = Array(26);
  ROWS.forEach((row, r) =>
    [...row].forEach((ch, i) => {
      const c = rowCoord(r);
      out[ch.charCodeAt(0) - 65] = [(i - (row.length - 1) / 2) * spacing, c.y ?? base[1], c.z ?? base[2]];
    }),
  );
  return out;
}

export const KEY_POS = grid((r) => ({ z: 0.5 + r * 0.29 }), [0, PLATE_Y, 0], 0.32);
export const LAMP_POS = grid((r) => ({ z: -0.56 + r * 0.26 }), [0, PLATE_Y, 0], 0.3);
export const PLUG_POS = grid((r) => ({ y: 0.66 - r * 0.2 }), [0, 0, CASE.d / 2 + 0.02], 0.3);

export const ROTOR = { y: 0.74, z: -1.04, x: [-0.42, 0, 0.42], ringR: 0.3, wheelR: 0.37, contactR: 0.2 };
export const ETW_X = 0.8;
export const UKW_X = -0.8;

/** Fixed contact point in the housing frame for letter k, on the plane x. */
export function contact(x: number, k: number): Vec3 {
  const a = (k / 26) * Math.PI * 2;
  return [x, ROTOR.y + ROTOR.contactR * Math.cos(a), ROTOR.z + ROTOR.contactR * Math.sin(a)];
}

/** Rotation (about x) that puts letter p at the top of the rotor, under the cover window. */
export function rotorAngle(p: number) {
  const theta = ((p + 0.5) / 26) * Math.PI * 2;
  return -theta - Math.PI / 2;
}

/** Top of the rotor cover. */
export const COVER_Y = ROTOR.y + 0.33;

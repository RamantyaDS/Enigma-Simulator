import * as THREE from 'three';
import { ALPHABET } from '../engine/enigma';

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

const FONT = '600 {s}px "IBM Plex Sans", Arial, sans-serif';

export const letterTexture = (ch: string, fg: string, bg: string) =>
  make(`l${ch}${fg}${bg}`, 128, 128, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = fg;
    g.font = FONT.replace('{s}', '76');
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(ch, 64, 70);
  });

/** Alphabet ring around a rotor: u runs around the circumference, letters upright for the operator. */
export const ringTexture = () =>
  make('ring', 26 * 64, 96, (g) => {
    g.fillStyle = '#e8dfc6';
    g.fillRect(0, 0, 26 * 64, 96);
    g.fillStyle = '#1a1714';
    g.font = FONT.replace('{s}', '50');
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let i = 0; i < 26; i++) {
      g.fillRect(i * 64, 0, 2, 96);
      g.save();
      g.translate(i * 64 + 32, 48);
      g.rotate(-Math.PI / 2);
      g.fillText(ALPHABET[i], 0, 3);
      g.restore();
    }
  });

/** Procedural wood grain, so the site needs no image downloads. */
export function woodTexture(key: string, base: string, dark: string, repeat = 1) {
  const tex = make(`wood${key}`, 1024, 1024, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 1024);
    let seed = key.length * 9973;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const y0 = rand() * 1024;
      const amp = 4 + rand() * 18;
      const freq = 0.002 + rand() * 0.006;
      g.strokeStyle = dark;
      g.globalAlpha = 0.05 + rand() * 0.22;
      g.lineWidth = 0.5 + rand() * 3;
      g.beginPath();
      for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y0 + Math.sin(x * freq + i) * amp);
      g.stroke();
    }
    g.globalAlpha = 1;
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}

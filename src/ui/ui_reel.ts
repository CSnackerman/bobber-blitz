import { Vector2 } from 'three';
import { getLineTensionAlpha } from './ui_line_tension';

// todo: dynamic alpha (non-linear)

const reel_canvas = document.getElementById('reel_canvas') as HTMLCanvasElement;
const ctx = reel_canvas.getContext('2d') as CanvasRenderingContext2D;

const SIZE = 300; // internal resolution
const SCALE = 1;

const spiralPoints: Vector2[] = [];

// config
const TensionColor = '#0080ff';
const SafeZoneColor = 'lime';
const SpiralColor = '#0080A030';

export function setupUI_reel() {
  // set internal size (resolution)
  reel_canvas.width = SIZE;
  reel_canvas.height = SIZE;

  // fill background (invisible)
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // precalculate spiral points
  calcArchimedeanSpiral();
}

export function updateUI_reel() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawSpiral();
  drawSafeZone();
  drawTension();
}

export function disableUI_reel() {
  reel_canvas.style.display = 'block';
}

export function enableUI_reel() {
  reel_canvas.style.display = 'block';
}

function drawTension() {
  ctx.fillStyle = TensionColor;
  const tensionAlpha = getLineTensionAlpha();

  const pointIndex = Math.floor((spiralPoints.length - 1) * tensionAlpha);

  const v = spiralPoints.at(pointIndex) as Vector2;

  const radius = 15 * SCALE;
  ctx.beginPath();
  ctx.arc(v.x, v.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function isSafe(point: Vector2) {
  return false;
}

function drawSafeZone() {
  ctx.strokeStyle = SafeZoneColor;
  ctx.lineWidth = 14 * SCALE;
  ctx.lineCap = 'round';

  const nPoints = 200;
  const idx = 500;

  // ctx.beginPath();
  // ctx.moveTo(spiralPoints[idx].x, spiralPoints[idx].y);

  for (let i = idx; i < idx + nPoints; i++) {
    // const p = spiralPoints[i];
    // ctx.lineTo(p.x, p.y);
  }

  // ctx.stroke();
}

function drawSpiral() {
  ctx.strokeStyle = SpiralColor;
  ctx.lineWidth = 12 * SCALE;
  ctx.lineCap = 'round';

  const firstPoint = spiralPoints[0] as Vector2;
  ctx.beginPath();
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < spiralPoints.length; i++) {
    const p = spiralPoints[i] as Vector2;
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function calcArchimedeanSpiral() {
  const centerX = reel_canvas.width / 2;
  const centerY = reel_canvas.height / 2;
  const numTurns = 3;
  const spacing = 0.01;
  const scaleFactor = 7 * SCALE;

  const start = 1; // skip theta = 0

  for (let theta = start; theta < numTurns * Math.PI * 2; theta += spacing) {
    let radius = theta * scaleFactor;
    let x = centerX + radius * Math.cos(theta);
    let y = centerY + radius * Math.sin(theta);

    spiralPoints.push(new Vector2(x, y));
  }

  spiralPoints.reverse();
}

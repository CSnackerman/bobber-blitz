import { Vector2 } from 'three';
import { renderer } from '../core/renderer';

export const pointer = new Vector2();

function getCanvasRelativePosition(event: MouseEvent) {
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

function setPickPosition(event: MouseEvent) {
  const canvas = renderer.domElement;
  const pos = getCanvasRelativePosition(event);
  pointer.x = (pos.x / canvas.width) * 2 - 1;
  pointer.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
}

export function setupPointerHandler() {
  document.addEventListener('pointermove', setPickPosition);
}

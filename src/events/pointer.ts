import { Vector2 } from 'three';
import { renderer } from '../core/renderer';

export { pointer, setup as setupPointer };

const pointer = new Vector2();

function setup() {
  document.addEventListener('pointermove', update);
}

function update(event: MouseEvent) {
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height;
  pointer.set((x / canvas.width) * 2 - 1, (y / canvas.height) * -2 + 1);
}

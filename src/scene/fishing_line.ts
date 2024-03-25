import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import sceneRoot from './scene';
import { fishermanState, getFishingLineAnchorPoint } from './fisherman';
import { getTopBobberPoint } from './bobber';

let fishingLine: Line;

export function setupFishingLine() {
  const mat = new LineBasicMaterial({ color: '#a9d665' });

  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(50, 50, 50),
  ]);

  fishingLine = new Line(geometry, mat);

  fishingLine.visible = false;

  sceneRoot.add(fishingLine);
}

export function updateFishingLine() {
  if (fishermanState === 'FISHING') {
    fishingLine.visible = true;
    fishingLine.geometry.setFromPoints([
      getFishingLineAnchorPoint(),
      getTopBobberPoint(),
    ]);
  } else {
    fishingLine.visible = false;
  }
}

//todo: caternary curve & parabola

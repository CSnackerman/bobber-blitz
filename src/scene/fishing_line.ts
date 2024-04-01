import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import sceneRoot from './scene';
import {
  getFishingLineAnchorPoint,
  isCASTING,
  isFISHING,
  isFISH_ON,
  isIDLE,
  isREELING,
} from './fisherman';
import { getTopBobberPoint } from './bobber';
import { getFishPosition } from './fish';

let fishingLine: Line;

export function setupFishingLine() {
  const mat = new LineBasicMaterial({
    color: '#a9d665',
    transparent: true,
    opacity: 0.3,
  });

  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(50, 50, 50),
  ]);

  fishingLine = new Line(geometry, mat);

  fishingLine.visible = false;

  sceneRoot.add(fishingLine);
}

export function updateFishingLine() {
  if (isFISHING() || isFISH_ON()) {
    fishingLine.visible = true;
    fishingLine.geometry.setFromPoints([
      getFishingLineAnchorPoint(),
      getTopBobberPoint(),
    ]);
    return;
  }

  if (isREELING()) {
    fishingLine.geometry.setFromPoints([
      getFishingLineAnchorPoint(),
      getFishPosition(),
    ]);
    return;
  }

  if (isIDLE() || isCASTING()) {
    fishingLine.visible = false;
    return;
  }
}

//todo: caternary curve & parabola

import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import sceneRoot from './scene';
import { getFishingLineAnchorPoint } from './fisherman';
import { getTopBobberPoint } from './bobber';
import { getFishPosition } from './fish';
import {
  ON_CASTING,
  ON_FISHING,
  ON_FISH_FIGHT,
  RESET,
  STATE_CHANGE,
  receive,
  transmit,
} from '../events/event_manager';

let fishingLine: Line;

type FishingLineState = 'HIDDEN' | 'ATTACHED_BOBBER' | 'ATTACHED_FISH';

let fishingLineState: FishingLineState = 'HIDDEN';

function setFishingLineState(s: FishingLineState) {
  fishingLineState = s;
  transmit(STATE_CHANGE);
}

function is(s: FishingLineState) {
  return fishingLineState === s;
}

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

  // event handlers
  receive(RESET, () => {
    fishingLine.visible = false;
  });

  receive(ON_CASTING, () => {
    fishingLine.visible = false;
  });

  receive(ON_FISHING, () => {
    setFishingLineState('ATTACHED_BOBBER');
    fishingLine.visible = true;
  });

  receive(ON_FISH_FIGHT, () => {
    setFishingLineState('ATTACHED_FISH');
  });
}

export function updateFishingLine() {
  if (is('ATTACHED_BOBBER')) {
    fishingLine.geometry.setFromPoints([
      getFishingLineAnchorPoint(),
      getTopBobberPoint(),
    ]);
    return;
  }

  if (is('ATTACHED_FISH')) {
    fishingLine.geometry.setFromPoints([
      getFishingLineAnchorPoint(),
      getFishPosition(),
    ]);
    return;
  }
}

//todo: caternary curve & parabola

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

export type FishingLineState = 'HIDDEN' | 'ATTACHED_BOBBER' | 'ATTACHED_FISH';

let fishingLineState: FishingLineState = 'HIDDEN';

let update: (() => void) | null = null;

function setState(s: FishingLineState, func: (() => void) | null) {
  fishingLineState = s;
  update = func;
  transmit(STATE_CHANGE);
}

export function getFishingLineState() {
  return fishingLineState;
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
    setState('HIDDEN', null);
    fishingLine.visible = false;
  });

  receive(ON_CASTING, () => {
    setState('HIDDEN', null);
    fishingLine.visible = false;
  });

  receive(ON_FISHING, () => {
    setState('ATTACHED_BOBBER', () => {
      fishingLine.geometry.setFromPoints([
        getFishingLineAnchorPoint(),
        getTopBobberPoint(),
      ]);
    });

    fishingLine.visible = true;
  });

  receive(ON_FISH_FIGHT, () => {
    setState('ATTACHED_FISH', () => {
      fishingLine.geometry.setFromPoints([
        getFishingLineAnchorPoint(),
        getFishPosition(),
      ]);
    });
  });
}

export function updateFishingLine() {
  update?.();
}

//todo: caternary curve & parabola

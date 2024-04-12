import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import { Signals, State, receive } from '../core/state';
import { getBobberTopPoint } from './bobber';
import { getFishMouthPosition } from './fish';
import { getFishingLineAnchorPoint } from './fisherman';
import { rootScene } from './scene';

export { getState as getFishingLineState, update as updateFishingLine };

let fishingLine: Line;

enum FishingLineState {
  HIDDEN = 'HIDDEN',
  ATTACHED_BOBBER = 'ATTACHED_BOBBER',
  ATTACHED_FISH = 'ATTACHED_FISH',
}
const { HIDDEN, ATTACHED_BOBBER, ATTACHED_FISH } = FishingLineState;

const { RESET, CAST, BEGIN_FISHING, REEL_OUT } = Signals;

const state = new State<FishingLineState>(HIDDEN, null);

const getState = state.get;
const update = state.invoke;

function while_ATTACHED_BOBBER() {
  fishingLine.geometry.setFromPoints([
    getFishingLineAnchorPoint(),
    getBobberTopPoint(),
  ]);
}

function while_ATTACHED_FISH() {
  fishingLine.geometry.setFromPoints([
    getFishingLineAnchorPoint(),
    getFishMouthPosition(),
  ]);
}

function setupReceivers() {
  receive(RESET, () => {
    fishingLine.visible = false;
    state.set(HIDDEN, null);
  });

  receive(CAST, () => {
    fishingLine.visible = false;
    state.set(HIDDEN, null);
  });

  receive(BEGIN_FISHING, () => {
    fishingLine.visible = true;

    state.set(ATTACHED_BOBBER, while_ATTACHED_BOBBER);
  });

  receive(REEL_OUT, () => {
    state.set(ATTACHED_FISH, while_ATTACHED_FISH);
  });
}

export async function setupFishingLineAsync() {
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

  rootScene.add(fishingLine);

  setupReceivers();
}

//todo: caternary curve & parabola

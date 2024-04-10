import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import { Signals, State, observe } from '../core/state';
import { getBobberTopPoint } from './bobber';
import { getFishPosition } from './fish';
import { getFishingLineAnchorPoint } from './fisherman';
import { rootScene } from './scene';

let fishingLine: Line;

enum FishingLineState {
  HIDDEN = 'HIDDEN',
  ATTACHED_BOBBER = 'ATTACHED_BOBBER',
  ATTACHED_FISH = 'ATTACHED_FISH',
}
const { HIDDEN, ATTACHED_BOBBER, ATTACHED_FISH } = FishingLineState;

const state = new State<FishingLineState>(HIDDEN, null);

export const getFishingLineState = () => state.get();

function while_ATTACHED_BOBBER() {
  fishingLine.geometry.setFromPoints([
    getFishingLineAnchorPoint(),
    getBobberTopPoint(),
  ]);
}

function while_ATTACHED_FISH() {
  fishingLine.geometry.setFromPoints([
    getFishingLineAnchorPoint(),
    getFishPosition(),
  ]);
}

const { RESET, ON_CAST, ON_FISHING, ON_FISH_OFFENSE } = Signals;

function setupObservers() {
  observe(RESET, () => {
    fishingLine.visible = false;
    state.set(HIDDEN, null);
  });

  observe(ON_CAST, () => {
    fishingLine.visible = false;
    state.set(HIDDEN, null);
  });

  observe(ON_FISHING, () => {
    fishingLine.visible = true;

    state.set(ATTACHED_BOBBER, while_ATTACHED_BOBBER);
  });

  observe(ON_FISH_OFFENSE, () => {
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

  setupObservers();
}

export function updateFishingLine() {
  state.update();
}

//todo: caternary curve & parabola

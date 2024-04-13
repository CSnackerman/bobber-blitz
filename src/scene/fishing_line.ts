import { BufferGeometry, Clock, Line, LineBasicMaterial, Vector3 } from 'three';
import { Signals, State, emit, receive } from '../core/state';
import { getTrajectoryPoints } from '../util/physics';
import { getBobberTopPoint } from './bobber';
import { getFishPosition } from './fish';
import { getFishingLineAnchorPoint } from './fisherman';
import { rootScene } from './scene';

export {
  getState as getFishingLineState,
  setup as setupFishingLineAsync,
  update as updateFishingLine,
};

export const CAST_HEIGHT = 22;

let fishingLine: Line;
let animationClock: Clock;

async function setup() {
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

  console.log(fishingLine);
}

enum FishingLineState {
  HIDDEN = 'HIDDEN',
  CASTING = 'CASTING',
  ATTACHED_BOBBER = 'ATTACHED_BOBBER',
  ATTACHED_FISH = 'ATTACHED_FISH',
}
const { HIDDEN, CASTING, ATTACHED_BOBBER, ATTACHED_FISH } = FishingLineState;

const { RESET, CAST, ANIMATE_CAST_TRAJECTORY, BEGIN_FISHING, REEL_OUT } =
  Signals;

const state = new State<FishingLineState>(HIDDEN, null);

const getState = () => state.get();
const update = () => state.invoke();

function while_ANIMATE_CASTING() {
  const totalTime = 500; // ms
  const timestep = Math.floor(totalTime / 32);
  const elapsed = animationClock.getElapsedTime() * 1000;
  const currentTimestep = Math.floor(elapsed / timestep);
  fishingLine.geometry.setDrawRange(0, currentTimestep);

  if (elapsed >= totalTime) {
    animationClock.stop();
    emit(BEGIN_FISHING);
  }
}

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

function setupReceivers() {
  receive(RESET, () => {
    fishingLine.visible = false;
    state.set(HIDDEN, null);
  });

  receive(
    CAST,
    () => {
      fishingLine.visible = false;
      state.set(HIDDEN, null);
    },
    3
  );

  receive(
    ANIMATE_CAST_TRAJECTORY,
    () => {
      fishingLine.visible = true;
      fishingLine.geometry = new BufferGeometry().setFromPoints(
        getTrajectoryPoints(
          getFishingLineAnchorPoint(),
          getBobberTopPoint(),
          CAST_HEIGHT
        )
      );

      fishingLine.geometry.setDrawRange(0, 0);
      animationClock = new Clock(true);
      fishingLine.geometry.setDrawRange(0, 0);
      state.set(CASTING, while_ANIMATE_CASTING);
    },
    1 // prio
  );

  receive(BEGIN_FISHING, () => {
    fishingLine.visible = true;

    state.set(ATTACHED_BOBBER, while_ATTACHED_BOBBER);
  });

  receive(REEL_OUT, () => {
    state.set(ATTACHED_FISH, while_ATTACHED_FISH);
  });
}

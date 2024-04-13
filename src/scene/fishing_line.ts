import { BufferGeometry, Color, Line, LineBasicMaterial, Vector3 } from 'three';
import { CAST_CLOCK, getClock } from '../core/clock';
import { Signals, State, emit, receive } from '../core/state';
import { interpolateLine } from '../util/line';
import {
  getDanglingTrajectoryPoints,
  getTrajectoryPoints,
} from '../util/physics';
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
export const CAST_TIME = 500; // ms
const DESCEND_TIME = 1100; // ms

let fishingLine: Line;

const castClock = getClock(CAST_CLOCK);
let castPoints: Vector3[] = [];
let lineDanglingPoints: Vector3[] = [];

async function setup() {
  fishingLine = new Line(
    new BufferGeometry(),
    new LineBasicMaterial({
      color: '#a9d665',
      transparent: true,
      opacity: 0.3,
    })
  );

  fishingLine.visible = false;

  rootScene.add(fishingLine);

  setupReceivers();
}

enum FishingLineState {
  HIDDEN = 'HIDDEN',
  CASTING = 'CASTING',
  LINE_DESCENDING = 'LINE_DESCENDING',
  ATTACHED_BOBBER = 'ATTACHED_BOBBER',
  ATTACHED_FISH = 'ATTACHED_FISH',
}
const { HIDDEN, CASTING, LINE_DESCENDING, ATTACHED_BOBBER, ATTACHED_FISH } =
  FishingLineState;

const { RESET, CAST, LAUNCH_BOBBER, BOBBER_LANDED, BEGIN_FISHING, REEL_OUT } =
  Signals;

const state = new State<FishingLineState>(HIDDEN, null);

const getState = () => state.get();
const update = () => state.invoke();

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
    3 // prio
  );

  receive(
    LAUNCH_BOBBER,
    () => {
      fishingLine.visible = true;

      castPoints = getTrajectoryPoints(
        getFishingLineAnchorPoint(),
        getBobberTopPoint(),
        CAST_HEIGHT
      );

      fishingLine.geometry.setFromPoints(castPoints);

      fishingLine.geometry.setDrawRange(0, 0);
      fishingLine.geometry.setDrawRange(0, 0);
      state.set(CASTING, while_ANIMATE_CASTING);
    },
    1 // prio
  );

  receive(BOBBER_LANDED, () => {
    state.set(LINE_DESCENDING, while_BOBBER_LANDED());
  });

  receive(BEGIN_FISHING, () => {
    fishingLine.visible = true;

    state.set(ATTACHED_BOBBER, while_ATTACHED_BOBBER);
  });

  receive(REEL_OUT, () => {
    state.set(ATTACHED_FISH, while_ATTACHED_FISH);
  });
}

/// /// ///

function while_ANIMATE_CASTING() {
  const timestep = Math.floor(CAST_TIME / 32);
  const elapsed = castClock.getElapsedTime() * 1000;
  const currentTimestep = Math.floor(elapsed / timestep);
  fishingLine.geometry.setDrawRange(0, currentTimestep);

  if (elapsed >= CAST_TIME) {
    castClock.stop();
    emit(BOBBER_LANDED);
  }
}

function while_BOBBER_LANDED() {
  lineDanglingPoints = getDanglingTrajectoryPoints(
    getFishingLineAnchorPoint(),
    getBobberTopPoint()
  );

  castClock.start();

  return () => {
    const elapsed = castClock.getElapsedTime() * 1000;
    const alpha = elapsed / DESCEND_TIME;

    const points = interpolateLine(castPoints, lineDanglingPoints, alpha);

    fishingLine.geometry.setFromPoints(points);

    // mockClock.tick();

    if (elapsed >= DESCEND_TIME) {
      castClock.stop();
      emit(BEGIN_FISHING);
    }
  };
}

function while_ATTACHED_BOBBER() {
  // todo: update end of line to follow plunking bobber
}

function while_ATTACHED_FISH() {
  fishingLine.geometry.setFromPoints([
    getFishingLineAnchorPoint(),
    getFishPosition(),
  ]);
}

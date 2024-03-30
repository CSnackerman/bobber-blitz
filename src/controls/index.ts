import { isMobile } from '../util/device';
import { setupCastHandler } from './cast';
import { setupReelControls_Desktop } from './reel';

export function setupControls() {
  // platform universal controls
  setupCastHandler();

  // platform specific controls
  if (isMobile() === true) {
    setupControls_Mobile();
  } else {
    setupControls_Desktop();
  }
}

function setupControls_Desktop() {
  setupReelControls_Desktop();
}

function setupControls_Mobile() {}

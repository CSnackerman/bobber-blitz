export let isSpaceDown = false;

export function setupReelControls_Desktop() {
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.isComposing) {
      return;
    }

    if (isSpaceDown === false && (e.key === ' ' || e.key === 'Spacebar')) {
      isSpaceDown = true;
    }
  });

  addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.isComposing) {
      return;
    }

    if (e.key === ' ' || e.key === 'Spacebar') {
      isSpaceDown = false;
    }
  });
}

export function setupReelControls_Mobile() {}

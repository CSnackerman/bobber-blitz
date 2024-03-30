import { getBobberScreenCoords } from '../scene/bobber';
import { isFISH_ON } from '../scene/fisherman';

const template = document.getElementById(
  'template_fish_on'
) as HTMLTemplateElement;

const fishOn_H3 = template.content.querySelector('h3') as HTMLHeadingElement;

export function setupUI_fishOn() {
  document.body.appendChild(fishOn_H3);
}

export function updateUI_fishOn() {
  if (!isFISH_ON()) return;

  const bobberPosition = getBobberScreenCoords();
  const rect = fishOn_H3.getBoundingClientRect();
  const halfWidth = rect.width / 2;

  const fontSizeOffset = Math.ceil(
    (bobberPosition.y / window.innerHeight) * 15
  );
  fishOn_H3.style.fontSize = `${6 + fontSizeOffset}px`;
  fishOn_H3.style.top = `${bobberPosition.y + rect.height}px`;
  fishOn_H3.style.left = `${bobberPosition.x - halfWidth}px`;
}

export function hideUI_fishOn() {
  fishOn_H3.style.visibility = 'hidden';
}

export function showUI_fishOn() {
  fishOn_H3.style.visibility = 'visible';
}

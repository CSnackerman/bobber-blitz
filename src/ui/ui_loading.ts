import { getRandomInt } from '../util/random.ts';

const loadingElement = document
  .querySelector<HTMLTemplateElement>('#template-loading')!
  .content.querySelector('#loading')!;

let domElement: Element;

export function setupUI_loading() {
  console.log('loadingEl', loadingElement);
  let manySpaces = '';
  for (let i = 0; i < 1000; i++) {
    manySpaces += '&nbsp;';
  }
  for (let i = 0; i < 42; i++) {
    const waveDiv = document.createElement('div');
    waveDiv.style.animationDelay = `-${i * 75}ms`;
    waveDiv.style.animationDuration = `${getRandomInt(4, 5)}s, 1.3s`;
    waveDiv.style.marginLeft = `${getRandomInt(-50, 50)}px`;
    waveDiv.innerHTML = manySpaces;
    loadingElement.appendChild(waveDiv);
  }
  domElement = document.body.appendChild(loadingElement);
}

export function removeUI_loading() {
  domElement?.remove();
}

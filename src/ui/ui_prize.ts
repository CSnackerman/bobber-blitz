import { Signals, receive, emit } from '../core/state';

const { RESET, CATCH_FISH } = Signals;

const template = document.getElementById(
  'template_prize'
) as HTMLTemplateElement;

const prize_card_div = template.content.getElementById(
  'prize_card'
) as HTMLDivElement;

const prize_content_div = template.content.getElementById(
  'prize_content'
) as HTMLDivElement;

const prize_alright = template.content.getElementById(
  'prize_alright'
) as HTMLButtonElement;

let fishType = 'Bass';

export function setupUI_prize() {
  document.body.appendChild(prize_card_div);

  prize_content_div.innerHTML = `You caught a <span>${fishType}</span> fish!`;

  prize_alright.addEventListener('click', () => {
    hideUI_prize();
    emit(RESET);
  });

  receive(CATCH_FISH, showUI_prize);

  hideUI_prize();
}

export function updateUI_prize() {}

export function hideUI_prize() {
  prize_card_div.style.visibility = 'hidden';
}

export function showUI_prize() {
  prize_card_div.style.visibility = 'visible';
}

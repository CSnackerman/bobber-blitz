export function getSpan(content: string | number, css_color: string = 'white') {
  const span = document.createElement('span');
  span.textContent = `${content}`;
  span.style.color = css_color;
  span.style.fontFamily = 'monospace';
  return span;
}

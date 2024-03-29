export function getSpan(content: string | number, css_color: string = 'white') {
  return `<span style="color:${css_color}">${content}</span>`;
}

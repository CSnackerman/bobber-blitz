// const data = new FormData(loginForm);

// const reqBody: { [key: string]: FormDataEntryValue } = {};

// for (const [key, value] of data) {
//   reqBody[key] = value;
// }

export function formToObj(form: HTMLFormElement) {
  const obj: { [key: string]: FormDataEntryValue } = {};
  for (const [key, value] of new FormData(form)) {
    obj[key] = value;
  }

  return obj;
}

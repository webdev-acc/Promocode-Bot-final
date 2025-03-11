import languages from "../assets/languages.json";

export const languagesToArray = () =>
  Object.entries(languages).map(([name, code]) => name);

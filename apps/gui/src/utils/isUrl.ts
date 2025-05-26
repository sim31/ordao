
export function isValidHttpUrl(str: string) {
  let url;

  if(/\s/.test(str)) {
    return false;
  }

  try {
    url = new URL(str);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
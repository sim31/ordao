import { ORClient, ORContext, Config, defaultConfig } from "./orclient.js";

function _getPublicFunctions(): string[] {
  return Object.getOwnPropertyNames(ORClient.prototype)
    .filter(m => m[0] != '_');
}

const _methods = _getPublicFunctions();
const _docPath = "/classes/ORClient.html";
const _indexPath = "/index.html";

function _printHelp() {
  console.log("orconsole object is available as object \'c\'");
  console.log("Available methods: ", _methods);
  console.log("Use c.<method>.help() to get further help on any of the methods.")
  console.log("Example: c.proposeRespectTo.help()")
  console.log("         c.vote.help()")
}

// TODO: add intro to documentation and about how to use the console.
export class ORConsole extends ORClient {

  constructor(context: ORContext, cfg: Config = defaultConfig) {
    super(context, cfg);

    _printHelp();
  }

}

export let consoleInitialized = false;

export function initConsole(docOrigin: string) {
  for (const fname of _methods) {
    const prop = (ORClient.prototype as any)[fname];
    const url = new URL(docOrigin);
    url.hash = fname;
    url.pathname = _docPath;
    if (prop !== undefined) {
      prop['help'] = () => {
        window.open(url, "_blank")?.focus();
      }
    }
  }

  (ORClient.prototype as any)['help'] = () => {
    const url = new URL(docOrigin);
    url.pathname = _indexPath;
    window.open(url, "_blank")?.focus();
  }

  consoleInitialized = true;
}
import { ORClient } from "@ordao/orclient";
import { ORClientReader } from "@ordao/orclient/orclientReader.js";

export type ORClientType = ORClient | ORClientReader;

export class ORClientServer {
  private _orclient?: ORClientType;
  private _orclientPromise: Promise<ORClientType>;
  private _resolveOrclient: (orclient: ORClientType) => void;


  constructor() {
    this._resolveOrclient = () => {}; // temporary to avoid TS errors
    this._orclientPromise = new Promise<ORClientType>((resolve) => {
      this._resolveOrclient = resolve;
    });
  }

  getOrclient(): Promise<ORClientType> {
    return this._orclientPromise;
  }

  getOrclientSync(): ORClientType | undefined {
    return this._orclient;
  }

  setOrclient(orclient: ORClientType | undefined) {
    if (orclient) {
      // Setting a new orclient
      if (this._orclient !== undefined) {
        // if orclient was already set, then unset it first (so that promise resolves to the new one)
        this._unsetOrclient();
      }
      this._setOrclient(orclient);
    } else {
      // Unsetting orclient
      this._unsetOrclient();
    }
  }

  private _unsetOrclient() {
    this._orclient = undefined;
    this._orclientPromise = new Promise<ORClientType>((resolve) => {
      this._resolveOrclient = resolve;
    });
  }

  private _setOrclient(orclient: ORClientType) {
    this._orclient = orclient;
    this._resolveOrclient(orclient);
  }


}
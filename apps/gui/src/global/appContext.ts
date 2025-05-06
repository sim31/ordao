import { ORClient } from "@ordao/orclient";
import { ORClientReader } from "@ordao/orclient/orclientReader.js";
import { ConnectedWallet } from "@privy-io/react-auth";

export type ORClientType = ORClient | ORClientReader;

export class AppContext {
  private _orclient?: ORClientType;
  private _orclientPromise: Promise<ORClientType>;
  private _resolveOrclient: (orclient: ORClientType) => void;

  private _privyReady: boolean = false;
  private _privyReadyPromise: Promise<void>;
  private _resolvePrivyReady: () => void;

  private _privyWallet?: ConnectedWallet;
  private _privyWalletPromise: Promise<ConnectedWallet>;
  private _resolvePrivyWallet: (orclient: ConnectedWallet) => void;

  constructor() {
    this._resolveOrclient = () => {}; // temporary to avoid TS errors
    this._resolvePrivyReady = () => {};
    this._resolvePrivyWallet = () => {};
    this._orclientPromise = new Promise<ORClientType>((resolve) => {
      this._resolveOrclient = resolve;
    });
    this._privyReadyPromise = new Promise<void>((resolve) => {
      this._resolvePrivyReady = resolve;
    })
    this._privyWalletPromise = new Promise<ConnectedWallet>((resolve) => {
      this._resolvePrivyWallet = resolve;
    })
  }

  getOrclient(): Promise<ORClientType> {
    return this._orclientPromise;
  }

  getOrclientSync(): ORClientType | undefined {
    return this._orclient;
  }

  getPrivyWallet(): Promise<ConnectedWallet> {
    return this._privyWalletPromise;
  }

  getPrivyWalletSync(): ConnectedWallet | undefined {
    return this._privyWallet;
  }

  getPrivyReadSync(): boolean {
    return this._privyReady;
  }

  async waitForPrivyReady() {
    await this._privyReadyPromise;
  }

  setPrivyReady(ready: boolean) {
    if (ready) {
      if (!this._privyReady) {
        this._privyReady = true;
        this._resolvePrivyReady();
      }
    } else {
      this._privyReady = false;
      this._privyReadyPromise = new Promise<void>((resolve) => {
        this._resolvePrivyReady = resolve;
      })
    }
  }

  setPrivyWallet(wallet: ConnectedWallet | undefined) {
    if (wallet) {
      if (this._privyWallet !== undefined) {
        this._unsetPrivyWallet();
      }
      this._setPrivyWallet(wallet);
    } else {
      this._unsetPrivyWallet();
    }
  }
  private _setPrivyWallet(wallet: ConnectedWallet) {
    this._privyWallet = wallet;
    this._resolvePrivyWallet(wallet);
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

  private _unsetPrivyWallet() {
    this._privyWallet = undefined;
    this._privyWalletPromise = new Promise<ConnectedWallet>((resolve) => {
      this._resolvePrivyWallet = resolve;
    })
  }

  private _setOrclient(orclient: ORClientType) {
    this._orclient = orclient;
    this._resolveOrclient(orclient);
  }


}
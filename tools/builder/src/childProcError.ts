
export class ChildProcError extends Error {
  innerErr: any;
  constructor(cmd: string, innerErr: any) {
    super(`Error executing command: ${cmd}`);
    this.innerErr = innerErr;
  }
}
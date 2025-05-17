
export { DecodedError, ErrorDecoder } from "@ordao/ethers-decode-error";

export class NotVoteTimeError extends Error {
  constructor() {
    super("Not vote time");
  }
}

export class NotVetoTimeError extends Error {
  timeRem?: number;
  constructor(timeRem_?: number) {
    super("Not veto time." + "Time remaining: " + timeRem_);
    this.timeRem = timeRem_;
  }
}


export { DecodedError, ErrorDecoder } from "@ordao/ethers-decode-error";

export class NotVoteTimeError extends Error {
  constructor() {
    super("Not vote time");
  }
}

export class NotVetoTimeError extends Error {
  constructor() {
    super("Not veto time");
  }
}

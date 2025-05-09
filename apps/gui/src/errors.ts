
export class OrclientUndefined extends Error {
  constructor(message?: string) {
    super(message ?? "ORClient is undefined");
  }
}

export class OrclientNotFull extends Error {
  constructor(message?: string) {
    super(message ?? "ORClient is not full");
  }
}
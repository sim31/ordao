import { z } from "zod";

export const zUrl = z.string().url();
export type Url = z.infer<typeof zUrl>;

export const zTimestamp = z.number().gte(0);
export type Timestamp = z.infer<typeof zTimestamp>

export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgumentError';
  }
}

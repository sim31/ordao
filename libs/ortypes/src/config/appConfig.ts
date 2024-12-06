import z from "zod";
import { zOrdaoConfig } from "./ordaoConfig.js";
import { zUrl } from "../common.js";

export const zAppConfig = zOrdaoConfig.extend({
  app: z.object({
    ornodeUrl: zUrl
  })
});
import { z } from "zod";
import { zAppConfig } from "./appConfig";
import { zServiceConfig } from "./serviceConfig";

export const zGlobalConfig = zServiceConfig.merge(zAppConfig);
export type GlobalConfig = z.infer<typeof zGlobalConfig>;

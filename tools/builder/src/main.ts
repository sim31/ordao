#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { z } from "zod";
import { readFileSync } from "fs";
import { stringify } from "@ordao/ts-utils";
import { BuildConfig, zBuildConfig } from "./config";

const zBuildArgs = z.union([z.string().array(), z.string()])
  .transform((arg, ctx) => {
    if (Array.isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  })
  .pipe(z.string().array());
type BuildArgs = z.infer<typeof zBuildArgs>;

const program = new Command();

program
  .name('ordao-builder')
  .description("Tool to create and manage ORDAO deployments")
  .option('-d, --debug', 'debug outputs')
  .version(version)

const globalOpts = program.opts();

program.command('build')
  .description("Build ordao deployment")
  .argument("<config-files...>", "One or more configuration files. All of them are merged into one.")
  .action((args) => {
    const configPaths = zBuildArgs.parse(args);
    let fullConfig: any = {};
    for (const cpath of configPaths) {
      try {
        const configObj = JSON.parse(readFileSync(cpath, 'utf-8'));
        if (globalOpts.debug) {
          console.debug(`Read config object: ${stringify(configObj)}`)
        }
        fullConfig = { ...fullConfig, ...configObj };
      } catch(err) {
        console.error(`Error reading file ${cpath}: ${err}`);
        process.exitCode = 1;
        return;
      }     
    }

    if (globalOpts.debug) {
      console.debug(`Merged config file: ${stringify(fullConfig)}`);
    }

    let buildConfig: BuildConfig;
    try {
      buildConfig = zBuildConfig.parse(fullConfig);
    } catch(err) {
      console.error(`Error parsing config: ${err}`);
      process.exitCode = 1;
      return;
    }
    if (globalOpts.debug) {
      console.debug(`Parsed full config: ${stringify(buildConfig)}`);
    }
  })

program.parse()

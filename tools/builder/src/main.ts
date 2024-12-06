#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { z } from "zod";
import { readFileSync } from "fs";
import { stringify } from "@ordao/ts-utils";

const zBuildConfig = z.union([z.string().array(), z.string()])
  .transform((arg, ctx) => {
    if (Array.isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  })
  .pipe(z.string().array());
type BuildConfig = z.infer<typeof zBuildConfig>;

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
    const configPaths = zBuildConfig.parse(args);
    const configObjs: any[] = [];
    for (const cpath of configPaths) {
      try {
        const configObj = JSON.parse(readFileSync(cpath, 'utf-8'));
        configObjs.push(configObj);
        if (globalOpts.debug) {
          console.debug(`Read config object: ${stringify(configObj)}`)
        }
      } catch(err) {
        console.error(`Error reading file ${cpath}: ${err}`);
        process.exitCode = 1;
      }     
    }
  })

program.parse()

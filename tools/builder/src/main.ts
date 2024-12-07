#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { z } from "zod";
import { readFileSync } from "fs";
import { stringify } from "@ordao/ts-utils";
import { BuildConfig, zBuildConfig } from "./config";
import merge from "lodash/merge";
import { Builder } from "./builder";

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

// TODO: options to build only onchain or only off-chain parts
program.command('build')
  .description("Build ordao deployment")
  .argument("<builds-path>", "Where to put build output. Will look for directory by the name of a build (see BuildConfig type) there or create one if it does not exit")
  .argument("<config-files...>", "One or more configuration files. All of them are merged into one.")
  .action((buildsPath, args) => {
    const configPaths = zBuildArgs.parse(args);
    console.log("config paths: ", configPaths);
    const configObjs: any[] = [];
    for (const cpath of configPaths) {
      try {
        const configObj = JSON.parse(readFileSync(cpath, 'utf-8'));
        if (globalOpts.debug) {
          console.debug(`Read config object: ${stringify(configObj)}`)
        }
        // TODO: do a deep merge: https://lodash.com/docs/4.17.15#merge
        configObjs.push(configObj);
      } catch(err) {
        console.error(`Error reading file ${cpath}: ${err}`);
        process.exitCode = 1;
        return;
      }     
    }

    let fullConfig = {};
    merge(fullConfig, ...configObjs);

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

    try {
      const builder = new Builder(buildConfig, buildsPath);
      builder.build();
    } catch(err) {
      console.error("Error building: ", err);
      process.exitCode = 1;
    }
  })

program.parse()

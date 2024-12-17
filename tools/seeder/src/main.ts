#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { z } from "zod";
import { readFileSync } from "fs";
import { stringify } from "@ordao/ts-utils";
import { SeedConfig, zSeedConfig } from "./config";
import merge from "lodash/merge";
import { Seeder } from "./seeder";

const zCfgPathsArg = z.union([z.string().array(), z.string()])
  .transform((arg, ctx) => {
    if (Array.isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  })
  .pipe(z.string().array());
type BuildArgs = z.infer<typeof zCfgPathsArg>;

const program = new Command();

program
  .name('ordao-seeder')
  .description("Tool to create ORDAO type fractals (by deploying and verifying ORDAO contracts onchain)")
  .description("")
  .option('-d, --debug', 'debug outputs')
  .option('-c --create', 'create / update a npm project for deployment')
  .option('-e --deploy', 'deploy contracts from a project already created')
  .option('-v --verify', 'verify contracts already deployed')
  .option('-o --output', 'create seed definition file')
  .option('-s --status', 'show status of deployment and deployed contract addresses')
  .option('-a --all', 'shortcut for \'-ceo\' options')
  .version(version)
  .argument("<seeds-path>", "Where to put the output. Will look for directory by the name of a seed (see SeedConfig type) there or create one if it does not exit. If directory for the build already exists, and create flag is present, it will update the seed files (by overwriting them) but will not delete information about existing deployments).")
  .argument("<config-files...>", "One or more configuration files. All of them are merged into one. Use this to split public part of config that can be committed to source control from private parts")
  .showHelpAfterError()
  .action(async (seedsPath, cfgPaths, opts) => {
    console.debug()
    const configPaths = zCfgPathsArg.parse(cfgPaths);
    console.log("config paths: ", configPaths);
    const configObjs: any[] = [];
    for (const cpath of configPaths) {
      try {
        const configObj = JSON.parse(readFileSync(cpath, 'utf-8'));
        if (opts.debug) {
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

    if (opts.debug) {
      console.debug(`Merged config file: ${stringify(fullConfig)}`);
    }

    let seedConfig: SeedConfig;
    try {
      seedConfig = zSeedConfig.parse(fullConfig);
    } catch(err) {
      console.error(`Error parsing config: ${err}`);
      process.exitCode = 1;
      return;
    }
    if (opts.debug) {
      console.debug(`Parsed full config: ${stringify(seedConfig)}`);
    }

    const create = opts.all || opts.create;
    const deploy = opts.all || opts.deploy;
    const verify = opts.all || opts.verify;
    const output = opts.all || opts.output;
    const status = opts.status;

    try {
      const seeder = new Seeder(seedConfig, seedsPath);
      if (create) {
        await seeder.create();
      }
      if (deploy) {
        await seeder.deploy();
      }
      if (verify) {
        await seeder.verify();
      }
      if (output) {
        await seeder.writeSeedDef();
      }
      if (status) {
        await seeder.showStatus();
      }
    } catch(err) {
      console.error("Error in seeder: ", err);
      process.exitCode = 1;
    }
  })



program.parse()

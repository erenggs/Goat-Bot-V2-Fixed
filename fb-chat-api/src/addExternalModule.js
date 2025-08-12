"use strict";

const fs = require("fs");
const path = require("path");
const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Add external modules to the API.
   * Supports:
   *   - Passing an object with API functions
   *   - Passing a folder path with .js files exporting API functions
   */
  return function addExternalModule(moduleObjOrPath) {
    // === LOAD FROM FOLDER ===
    if (typeof moduleObjOrPath === "string") {
      const folderPath = path.resolve(moduleObjOrPath);

      if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
        throw new Error(`❌ The folder "${folderPath}" does not exist or is not a directory!`);
      }

      const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

      let loadedCount = 0;
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        try {
          const moduleObj = require(filePath);

          if (utils.getType(moduleObj) === "Object") {
            for (let apiName in moduleObj) {
              if (utils.getType(moduleObj[apiName]) === "Function") {
                api[apiName] = moduleObj[apiName](defaultFuncs, api, ctx);
              } else {
                console.warn(
                  `⚠️ Skipped "${apiName}" in "${file}" — must be a function, got ${utils.getType(moduleObj[apiName])}.`
                );
              }
            }
            loadedCount++;
          } else {
            console.warn(`⚠️ Skipped "${file}" — must export an object, got ${utils.getType(moduleObj)}.`);
          }
        } catch (err) {
          console.error(`❌ Failed to load module "${file}": ${err.message}`);
        }
      }

      console.log(`✅ Successfully loaded ${loadedCount} modules from "${folderPath}".`);
    }

    // === LOAD FROM OBJECT ===
    else if (utils.getType(moduleObjOrPath) === "Object") {
      for (let apiName in moduleObjOrPath) {
        if (utils.getType(moduleObjOrPath[apiName]) === "Function") {
          api[apiName] = moduleObjOrPath[apiName](defaultFuncs, api, ctx);
        } else {
          console.warn(
            `⚠️ Skipped "${apiName}" — must be a function, got ${utils.getType(moduleObjOrPath[apiName])}.`
          );
        }
      }
    }

    // === INVALID TYPE ===
    else {
      throw new Error(`❌ Argument must be an object or folder path, not ${utils.getType(moduleObjOrPath)}!`);
    }
  };
};

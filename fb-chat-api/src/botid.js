"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Cache for bot ID to avoid repeated API calls
   * @type {string|null}
   */
  let cachedBotID = null;

  /**
   * Get the bot's Facebook user ID
   * @returns {Promise<string>} Resolves to bot user ID as string
   */
  function getBotID() {
    return new Promise((resolve, reject) => {
      if (cachedBotID) {
        return resolve(cachedBotID);
      }
      if (ctx.userID) {
        cachedBotID = ctx.userID;
        return resolve(ctx.userID);
      }

      // fallback: fetch current user info from API to get bot ID
      if (typeof api.getCurrentUserID === "function") {
        api.getCurrentUserID((err, userID) => {
          if (err) return reject(err);
          cachedBotID = userID;
          ctx.userID = userID;
          resolve(userID);
        });
      } else if (typeof api.getCurrentUserInfo === "function") {
        // alternative fallback
        api.getCurrentUserInfo()
          .then((info) => {
            if (!info || !info.id) return reject(new Error("Failed to get bot ID"));
            cachedBotID = info.id;
            ctx.userID = info.id;
            resolve(info.id);
          })
          .catch(reject);
      } else {
        reject(new Error("API method to get bot ID not found"));
      }
    });
  }

  /**
   * Set or override the bot's user ID manually
   * @param {string} id - Facebook user ID of bot
   */
  function setBotID(id) {
    if (typeof id !== "string") {
      throw new TypeError("setBotID: id must be a string");
    }
    cachedBotID = id;
    ctx.userID = id;
  }

  /**
   * Check if given ID matches the bot's ID
   * @param {string} id - Facebook user ID
   * @returns {Promise<boolean>} Resolves true if matches bot ID, else false
   */
  async function isBotID(id) {
    if (typeof id !== "string") {
      throw new TypeError("isBotID: id must be a string");
    }
    const botID = await getBotID();
    return id === botID;
  }

  /**
   * Clear cached bot ID (e.g. on logout or reconnect)
   */
  function clearCache() {
    cachedBotID = null;
    ctx.userID = null;
  }

  return {
    getBotID,
    setBotID,
    isBotID,
    clearCache,
  };
};

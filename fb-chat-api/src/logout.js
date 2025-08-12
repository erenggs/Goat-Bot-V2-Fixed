"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Logout the current user from Facebook.
   * @param {Function} [callback] - Optional callback (err).
   * @returns {Promise<void>} Promise if no callback provided.
   */
  return function logout(callback) {
    let resolveFunc, rejectFunc;

    // Promise wrapper to support both callback and promise usage
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = (err) => {
        if (err) return rejectFunc(err);
        resolveFunc();
      };
    }

    const settingsMenuUrl =
      "https://www.facebook.com/bluebar/modern_settings_menu/?help_type=364455653583099&show_contextual_help=1";

    // Step 1: Get logout form data from settings menu page
    defaultFuncs
      .post(settingsMenuUrl, ctx.jar, { pmid: "0" })
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        const logoutElem = resData.jsmods.instances[0][2][0].find(
          (v) => v.value === "logout"
        );
        if (!logoutElem) throw new Error("Logout element not found");

        const markupEntry = resData.jsmods.markup.find(
          (v) => v[0] === logoutElem.markup.__m
        );
        if (!markupEntry) throw new Error("Logout markup not found");

        const html = markupEntry[1].__html;

        const fb_dtsg = utils.getFrom(html, '"fb_dtsg" value="', '"');
        const ref = utils.getFrom(html, '"ref" value="', '"');
        const h = utils.getFrom(html, '"h" value="', '"');

        if (!fb_dtsg || !ref || !h)
          throw new Error("Missing logout form data fields");

        return { fb_dtsg, ref, h };
      })
      // Step 2: Post logout form to perform logout
      .then(({ fb_dtsg, ref, h }) => {
        return defaultFuncs
          .post(
            "https://www.facebook.com/logout.php",
            ctx.jar,
            { fb_dtsg, ref, h }
          )
          .then((res) => {
            if (!res.headers || !res.headers.location)
              throw new Error("Logout response missing redirect location");
            return res.headers.location;
          });
      })
      // Step 3: Follow redirect to complete logout process
      .then((redirectUrl) => defaultFuncs.get(redirectUrl, ctx.jar))
      .then(utils.saveCookies(ctx.jar))
      // Step 4: Finalize logout context state and callback
      .then(() => {
        ctx.loggedIn = false;
        log.info("logout", "Logged out successfully.");
        callback();
      })
      .catch((err) => {
        log.error("logout", err);
        callback(err);
      });

    return returnPromise;
  };
};

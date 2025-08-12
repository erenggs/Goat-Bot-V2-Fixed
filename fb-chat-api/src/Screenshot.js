/* eslint-disable linebreak-style */
"use strict";

module.exports = function (defaultFuncs, api, ctx) {
    // Collect cookies from all Facebook-related domains
    let Cookies = [
        ...ctx.jar.getCookies("https://www.facebook.com"),
        ...ctx.jar.getCookies("https://facebook.com"),
        ...ctx.jar.getCookies("https://www.messenger.com")
    ].map(cookie => ({
        ...cookie,
        name: cookie.key,
        domain: "www.facebook.com",
        ...(delete cookie.key && cookie)
    }));

    return function (Link, callback) {
        const logger = require("../logger");

        // Ensure Puppeteer is installed
        try {
            require("puppeteer");
        } catch {
            const { execSync } = require("child_process");
            try {
                execSync("npm install puppeteer", { stdio: "inherit" });
                logger.Info("Puppeteer installed successfully.");
            } catch (installErr) {
                logger.Error("Failed to install Puppeteer:", installErr);
                return callback(installErr, null);
            }
        }

        const Screenshot = require("../Extra/ExtraScreenShot");

        let resolveFunc, rejectFunc;
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = (err, data) => {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }

        (async () => {
            try {
                // Normalize link for screenshot capture
                let finalLink = Link;

                if (/facebook\.com|fb/i.test(Link)) {
                    const parts = Link.split("/");

                    if (Link.startsWith("https:")) {
                        if (Link.includes("messages")) {
                            finalLink = Link; // Messenger chat link
                        } else {
                            // Check for numeric ID
                            const idMatch = Link.match(/id=(\d+)/);
                            if (idMatch) {
                                finalLink = `https://www.facebook.com/profile.php?id=${idMatch[1]}`;
                            } else if (parts[3]) {
                                finalLink = `https://www.facebook.com/${parts[3]}`;
                            }
                        }
                    } else {
                        // Short format facebook.com/username
                        finalLink = `https://www.facebook.com/${parts[1]}`;
                    }

                    return callback(null, await Screenshot.buffer(finalLink, { cookies: Cookies }));
                }

                // For non-Facebook links
                return callback(null, await Screenshot.buffer(Link));

            } catch (err) {
                logger.Error("Screenshot capture failed:", err);
                callback(err, null);
            }
        })();

        return returnPromise;
    };
};

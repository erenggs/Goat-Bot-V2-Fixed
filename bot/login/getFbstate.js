const axios = require("axios");

/**
 * Converts a full-permission Facebook access token into session cookies.
 * @param {string} tokenFullPermission - Facebook access token with full permissions
 * @returns {Promise<Array<{key: string, value: string}>>} Array of session cookies
 * @throws Will throw an error if the token is invalid
 */
module.exports = async function (tokenFullPermission) {
  if (!tokenFullPermission) throw new Error("Access token is required");

  try {
    // Step 1: Get the app ID associated with the token
    const appResponse = await axios.get('https://graph.facebook.com/app', {
      params: { access_token: tokenFullPermission }
    });

    if (appResponse.data.error) throw new Error("Token is invalid");

    const appId = appResponse.data.id;
    if (!appId) throw new Error("Failed to retrieve app ID");

    // Step 2: Generate session cookies for the app
    const sessionResponse = await axios.get('https://api.facebook.com/method/auth.getSessionforApp', {
      params: {
        access_token: tokenFullPermission,
        format: "json",
        new_app_id: appId,
        generate_session_cookies: 1
      }
    });

    if (sessionResponse.data.error_code) throw new Error("Token is invalid");

    // Return session cookies mapped to {key, value} format
    if (Array.isArray(sessionResponse.data.session_cookies)) {
      return sessionResponse.data.session_cookies.map(cookie => {
        return { key: cookie.name, value: cookie.value };
      });
    } else {
      throw new Error("No session cookies returned");
    }

  } catch (err) {
    throw new Error(`Failed to convert token: ${err.message}`);
  }
};

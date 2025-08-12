"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Add one or more users to a group thread
   * @param {string|number|Array<string|number>} userID - Single or multiple user IDs
   * @param {string|number} threadID - Group thread ID
   * @param {function} [callback] - Optional callback(err)
   * @returns {Promise<void>}
   */
  async function addUserToGroup(userID, threadID, callback) {
    // Backward compatibility: callback as 2nd argument
    if (
      !callback &&
      (utils.getType(threadID) === "Function" ||
        utils.getType(threadID) === "AsyncFunction")
    ) {
      throw new Error("Please pass a threadID as the second argument.");
    }

    // Promise wrapper for callback support
    let promiseResolve, promiseReject;
    const returnPromise = new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    if (!callback) {
      callback = (err) => (err ? promiseReject(err) : promiseResolve());
    }

    // Validate threadID
    if (!["Number", "String"].includes(utils.getType(threadID))) {
      throw new Error(
        `ThreadID must be a Number or String, not ${utils.getType(threadID)}.`
      );
    }

    // Normalize userID to array
    if (utils.getType(userID) !== "Array") {
      userID = [userID];
    }

    // Validate all userIDs
    for (const id of userID) {
      if (!["Number", "String"].includes(utils.getType(id))) {
        throw new Error(
          `Each userID must be a Number or String, not ${utils.getType(id)}.`
        );
      }
    }

    // Prepare form data
    const messageAndOTID = utils.generateOfflineThreadingID();
    const form = {
      client: "mercury",
      action_type: "ma-type:log-message",
      author: `fbid:${ctx.userID}`,
      thread_id: "",
      timestamp: Date.now(),
      timestamp_absolute: "Today",
      timestamp_relative: utils.generateTimestampRelative(),
      timestamp_time_passed: "0",
      is_unread: false,
      is_cleared: false,
      is_forward: false,
      is_filtered_content: false,
      is_filtered_content_bh: false,
      is_filtered_content_account: false,
      is_spoof_warning: false,
      source: "source:chat:web",
      "source_tags[0]": "source:chat",
      log_message_type: "log:subscribe",
      status: "0",
      offline_threading_id: messageAndOTID,
      message_id: messageAndOTID,
      threading_id: utils.generateThreadingID(ctx.clientID),
      manual_retry_cnt: "0",
      thread_fbid: threadID
    };

    // Add participants to form
    userID.forEach((id, i) => {
      form[`log_message_data[added_participants][${i}]`] = `fbid:${id}`;
    });

    try {
      const resData = await defaultFuncs
        .post("https://www.facebook.com/messaging/send/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw resData || new Error("Add to group failed.");
      }

      callback();
    } catch (err) {
      log.error("addUserToGroup", err);
      callback(err);
    }

    return returnPromise;
  }

  return addUserToGroup;
};

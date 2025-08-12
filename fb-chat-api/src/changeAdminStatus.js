"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Internal function to send MQTT request for admin status change
   */
  function sendAdminChange(threadID, adminIDs, adminStatus) {
    const wsContent = {
      request_id: Date.now(),
      type: 3,
      payload: {
        version_id: "3816854585040595",
        tasks: [],
        epoch_id: Date.now() * 1000,
        data_trace_id: null
      },
      app_id: "772021112871879"
    };

    adminIDs.forEach((id, index) => {
      wsContent.payload.tasks.push({
        label: "25",
        payload: JSON.stringify({
          thread_key: threadID,
          contact_id: id,
          is_admin: adminStatus
        }),
        queue_name: "admin_status",
        task_id: index + 1,
        failure_count: null
      });
    });

    wsContent.payload = JSON.stringify(wsContent.payload);

    return new Promise((resolve, reject) => {
      if (!ctx.mqttClient) {
        return reject(new Error("MQTT client is not connected"));
      }
      ctx.mqttClient.publish("/ls_req", JSON.stringify(wsContent), {}, (err) => {
        if (err) return reject(err);
        resolve({
          success: true,
          threadID,
          adminIDs,
          adminStatus
        });
      });
    });
  }

  return {
    /**
     * Change admin status for one or more users
     */
    changeAdminStatus(threadID, adminID, adminStatus) {
      if (utils.getType(threadID) !== "String") {
        throw { error: "changeAdminStatus: threadID must be a string" };
      }
      if (utils.getType(adminID) !== "String" && utils.getType(adminID) !== "Array") {
        throw { error: "changeAdminStatus: adminID must be a string or an array" };
      }
      if (utils.getType(adminStatus) !== "Boolean") {
        throw { error: "changeAdminStatus: adminStatus must be true or false" };
      }

      const ids = Array.isArray(adminID) ? adminID : [adminID];
      return sendAdminChange(threadID, ids, adminStatus);
    },

    /**
     * Add one or more admins to a group
     */
    addAdmin(threadID, adminID) {
      return this.changeAdminStatus(threadID, adminID, true);
    },

    /**
     * Remove one or more admins from a group
     */
    removeAdmin(threadID, adminID) {
      return this.changeAdminStatus(threadID, adminID, false);
    },

    /**
     * Toggle admin status for one or more users
     */
    async toggleAdmin(threadID, adminID) {
      if (utils.getType(threadID) !== "String") {
        throw { error: "toggleAdmin: threadID must be a string" };
      }
      if (utils.getType(adminID) !== "String" && utils.getType(adminID) !== "Array") {
        throw { error: "toggleAdmin: adminID must be a string or an array" };
      }

      const ids = Array.isArray(adminID) ? adminID : [adminID];
      const info = await api.getThreadInfo(threadID);
      const adminList = info.adminIDs || [];

      // Determine if each user is currently admin, then flip status
      const results = [];
      for (const id of ids) {
        const isCurrentlyAdmin = adminList.includes(id.toString());
        await sendAdminChange(threadID, [id], !isCurrentlyAdmin);
        results.push({ id, newStatus: !isCurrentlyAdmin });
      }

      return {
        success: true,
        threadID,
        changes: results
      };
    }
  };
};

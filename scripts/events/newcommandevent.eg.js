/**
 * @Vietnamese
 * Đây là phiên bản nâng cấp xử lý tất cả sự kiện trong nhóm với NodeJS và API không chính thức của Facebook.
 * Bao gồm kiểm tra khi có thành viên mới, gửi lời chào, và có thể mở rộng cho các sự kiện khác.
 */

/**
 * @English
 * This is an upgraded version that handles all events in the group using NodeJS and unofficial Facebook API.
 * It includes new member greetings and can be extended to handle more events.
 */

module.exports = {
    config: {
        name: "allEventsHandler", // Unique name for command
        version: "2.0", // Version upgraded
        author: "NTKhang + eran", // Author
        category: "events" // Must be "events"
    },

    langs: {
        vi: {
            hello: "xin chào thành viên mới",
            helloWithName: "xin chào thành viên mới, id facebook của bạn là %1"
        },
        en: {
            hello: "hello new member",
            helloWithName: "hello new member, your facebook id is %1"
        }
    },

    /**
     * onStart executes for any new event
     */
    onStart: async function ({ api, usersData, threadsData, message, event, userModel, threadModel, prefix, dashBoardModel, globalModel, dashBoardData, globalData, envCommands, envEvents, envGlobal, role, getLang, commandName }) {
        try {
            // Handle user joined group
            if (event.logMessageType === "log:subscribe") {
                const addedUsers = event.logMessageData.addedParticipants;
                
                for (const user of addedUsers) {
                    // Send simple hello
                    await message.send(getLang("hello"));

                    // Send hello with user's name (uncomment if needed)
                    // await message.send(getLang("helloWithName", user.fullName));
                }
            }

            // Handle user left group
            if (event.logMessageType === "log:unsubscribe") {
                const leftUsers = event.logMessageData.leftParticipants;
                for (const user of leftUsers) {
                    await message.send(`User ${user.fullName} has left the group.`);
                }
            }

            // Handle other types of events dynamically
            if (global.GoatBot?.onEvent) {
                for (const fn of global.GoatBot.onEvent) {
                    try {
                        await fn({ api, usersData, threadsData, message, event, userModel, threadModel, prefix, dashBoardModel, globalModel, dashBoardData, globalData, envCommands, envEvents, envGlobal, role, getLang, commandName });
                    } catch (e) {
                        console.error(`Error in registered onEvent:`, e);
                    }
                }
            }

        } catch (error) {
            console.error(`Error in ${commandName} event:`, error);
        }
    }
};

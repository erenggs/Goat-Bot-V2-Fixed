module.exports = {
  config: {
    name: "プロフィール",
    aliases: ["pfpp", "ppp", "プロフ"],
    version: "1.2",
    author: "eran",
    countDown: 10,
    role: 0,
    description: "ユーザーのプロフィール画像を表示します。",
    category: "画像",
    guide: {
      ja: "{pn} @メンション またはユーザーID、返信、またはFacebookのURLを指定"
    }
  },

  onStart: async function ({ event, message, usersData, args }) {
    const getAvatarUrl = async (uid) => await usersData.getAvatarUrl(uid);
    const uid = Object.keys(event.mentions)[0] || args[0] || event.senderID;
    let avatarUrl;

    try {
      if (event.type === "message_reply") {
        avatarUrl = await getAvatarUrl(event.messageReply.senderID);
      } else if (args.join(" ").includes("facebook.com")) {
        const match = args.join(" ").match(/(\d+)/);
        if (match) {
          avatarUrl = await getAvatarUrl(match[0]);
        } else {
          throw new Error("❌ 無効なFacebookのURLです。");
        }
      } else {
        avatarUrl = await getAvatarUrl(uid);
      }

      await message.reply({
        body: "🖼️ プロフィール画像はこちらです:",
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });
    } catch (error) {
      message.reply(`⚠️ エラーが発生しました: ${error.message}`);
    }
  }
};

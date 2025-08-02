module.exports = {
  config: {
    name: "bankrob",
    aliases: ["balrob", "steal", "heist"],
    version: "3.0",
    author: "Eran",
    countDown: 15,
    role: 0,
    description: {
      en: "Attempt to rob another user's bank balance",
      vi: "Cố gắng cướp tiền từ ngân hàng của người khác"
    },
    category: "economy",
    guide: {
      en: "{pn} @user — Attempt to rob a user",
      vi: "{pn} @tag — Cố gắng cướp tiền người khác"
    }
  },

  langs: {
    en: {
      noMention: "❌ Please mention someone to rob.",
      selfRob: "😒 You can’t rob yourself.",
      poorTarget: "🚫 %1$ has no money in the bank to steal!",
      fail: "💥 You got caught! You paid a fine of %1$.",
      success: "💸 You successfully robbed %1$ from %2$'s bank!",
      notEnough: "❌ You don't have enough to pay the fine. Bank: %1$"
    },
    vi: {
      noMention: "❌ Vui lòng tag người bạn muốn cướp.",
      selfRob: "😒 Bạn không thể tự cướp chính mình.",
      poorTarget: "🚫 %1$ không có tiền trong ngân hàng để cướp!",
      fail: "💥 Bạn đã bị bắt! Bạn bị phạt %1$.",
      success: "💸 Bạn đã cướp thành công %1$ từ ngân hàng của %2$!",
      notEnough: "❌ Bạn không đủ tiền để trả phạt. Ngân hàng: %1$"
    }
  },

  onStart: async function ({ message, event, usersData, getLang }) {
    const mentionID = Object.keys(event.mentions)[0];
    const senderID = event.senderID;

    if (!mentionID)
      return message.reply(getLang("noMention"));
    if (mentionID === senderID)
      return message.reply(getLang("selfRob"));

    const senderData = await usersData.get(senderID);
    const targetData = await usersData.get(mentionID);

    const senderBank = senderData.bank || 0;
    const targetBank = targetData.bank || 0;
    const targetName = event.mentions[mentionID].replace("@", "");

    if (targetBank <= 0)
      return message.reply(getLang("poorTarget", targetName));

    // 50% chance to succeed
    const success = Math.random() < 0.5;
    const maxStealAmount = Math.floor(targetBank * 0.4); // Steal up to 40%
    const stealAmount = Math.floor(Math.random() * (maxStealAmount - 100 + 1) + 100); // Min 100

    if (success) {
      await usersData.set(mentionID, { bank: targetBank - stealAmount });
      await usersData.set(senderID, { bank: senderBank + stealAmount });

      return message.reply(getLang("success", stealAmount, targetName));
    } else {
      const fine = Math.floor(stealAmount / 2);

      if (senderBank < fine)
        return message.reply(getLang("notEnough", senderBank));

      await usersData.set(senderID, { bank: senderBank - fine });
      return message.reply(getLang("fail", fine));
    }
  }
};

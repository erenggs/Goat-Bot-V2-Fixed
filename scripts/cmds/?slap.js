const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
 config: {
 name: "slap",
 version: "1.1",
 author: "eran",
 countDown: 5,
 role: 0,
 shortDescription: "Batslap image",
 longDescription: "Batslap image",
 category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
 guide: {
 en: " {pn} @tag"
 }
 },

 langs: {
 vi: {
 noTag: "Bạn phải tag người bạn muốn tát"
 },
 en: {
 noTag: "jare marbe ore tag kor🙂"
 }
 },

 onStart: async function ({ event, message, usersData, args, getLang }) {
 const uid1 = event.senderID;
 const uid2 = Object.keys(event.mentions)[0];
 if (!uid2)
 return message.reply(getLang("noTag"));
 const avatarURL1 = await usersData.getAvatarUrl(uid1);
 const avatarURL2 = await usersData.getAvatarUrl(uid2);
 const img = await new DIG.Batslap().getImage(avatarURL1, avatarURL2);
 const pathSave = `${__dirname}/tmp/${uid1}_${uid2}Batslap.png`;
 fs.writeFileSync(pathSave, Buffer.from(img));
 const content = args.join(' ').replace(Object.keys(event.mentions)[0], "");
 message.reply({
 body: `${(content || "Bópppp 😵‍💫😵")}`,
 attachment: fs.createReadStream(pathSave)
 }, () => fs.unlinkSync(pathSave));
 }
};

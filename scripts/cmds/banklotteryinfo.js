else if (subCmd === "info") {
  // Get lottery data
  let lotteryData = await usersData.get(this.storageKey) || { tickets: {}, totalTickets: 0 };
  const totalTickets = lotteryData.totalTickets || 0;
  const participants = Object.keys(lotteryData.tickets || {}).length;
  const prizePool = totalTickets * this.ticketPrice;

  if (totalTickets === 0) {
    return message.reply(getLang("noTickets"));
  }

  // Sort top buyers descending
  const sortedBuyers = Object.entries(lotteryData.tickets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  let topList = "";
  for (let i = 0; i < sortedBuyers.length; i++) {
    const [uid, tickets] = sortedBuyers[i];
    let userName = uid;
    if (event.threadID && api && api.getUserInfo) {
      try {
        const userInfo = await api.getUserInfo(uid);
        if (userInfo && userInfo[uid]) userName = userInfo[uid].name;
      } catch {}
    }
    topList += `${i + 1}. ${userName}: ${tickets} tickets\n`;
  }

  const text = getLang("infoMessage", totalTickets, participants, prizePool, topList.trim());
  return message.reply(text);
}

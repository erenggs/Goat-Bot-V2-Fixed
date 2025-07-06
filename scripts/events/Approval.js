📄 | Source code of "approve.js":


module.exports = {
	config: {
		name: "approve",
		version: "1.0",
		author: "Assistant",
		countDown: 5,
		role: 2, // Only bot admin can use
		description: "Approve a group to allow bot usage",
		category: "admin",
		guide: {
			en: "{pn} <threadID> - Approve a group by its thread ID\n{pn} list - Show all approved groups\n{pn} remove <threadID> - Remove approval from a group"
		}
	},

	langs: {
		vi: {
			missingThreadId: "⚠️ Vui lòng cung cấp ID nhóm để phê duyệt.",
			invalidThreadId: "⚠️ ID nhóm không hợp lệ.",
			groupApproved: "✅ Nhóm đã được phê duyệt thành công!\n📝 Tên nhóm: %1\n🆔 Thread ID: %2",
			groupAlreadyApproved: "⚠️ Nhóm này đã được phê duyệt trước đó.",
			approvalRemoved: "✅ Đã gỡ phê duyệt nhóm: %1 (%2)",
			groupNotApproved: "⚠️ Nhóm này chưa được phê duyệt.",
			approvedGroupsList: "📋 Danh sách nhóm đã phê duyệt:\n\n%1",
			noApprovedGroups: "📋 Chưa có nhóm nào được phê duyệt.",
			errorGettingGroupInfo: "❌ Không thể lấy thông tin nhóm. ID có thể không hợp lệ.",
			invalidSubcommand: "⚠️ Lệnh con không hợp lệ. Sử dụng: approve <threadID>, approve list, hoặc approve remove <threadID>"
		},
		en: {
			missingThreadId: "⚠️ Please provide a thread ID to approve.",
			invalidThreadId: "⚠️ Invalid thread ID.",
			groupApproved: "✅ Group approved successfully!\n📝 Group name: %1\n🆔 Thread ID: %2",
			groupAlreadyApproved: "⚠️ This group is already approved.",
			approvalRemoved: "✅ Approval removed from group: %1 (%2)",
			groupNotApproved: "⚠️ This group is not approved.",
			approvedGroupsList: "📋 List of approved groups:\n\n%1",
			noApprovedGroups: "📋 No groups have been approved yet.",
			errorGettingGroupInfo: "❌ Could not get group information. Thread ID may be invalid.",
			invalidSubcommand: "⚠️ Invalid subcommand. Use: approve <threadID>, approve list, or approve remove <threadID>"
		}
	},

	onStart: async function ({ message, args, threadsData, api, getLang }) {
		const subcommand = args[0];
		
		if (!subcommand) {
			return message.reply(getLang("missingThreadId"));
		}

		// List approved groups
		if (subcommand.toLowerCase() === "list") {
			try {
				const allThreads = await threadsData.getAll();
				const approvedGroups = allThreads.filter(thread => thread.data.groupApproved === true);
				
				if (approvedGroups.length === 0) {
					return message.reply(getLang("noApprovedGroups"));
				}

				let groupsList = "";
				for (let i = 0; i < approvedGroups.length; i++) {
					const thread = approvedGroups[i];
					groupsList += `${i + 1}. ${thread.threadName || "Unknown"} (${thread.threadID})\n`;
				}

				return message.reply(getLang("approvedGroupsList", groupsList));
			} catch (err) {
				console.error("Error listing approved groups:", err);
				return message.reply("❌ Error retrieving approved groups list.");
			}
		}

		// Remove approval
		if (subcommand.toLowerCase() === "remove") {
			const threadID = args[1];
			if (!threadID || isNaN(threadID)) {
				return message.reply(getLang("invalidThreadId"));
			}

			try {
				const threadData = await threadsData.get(threadID);
				if (!threadData.data.groupApproved) {
					return message.reply(getLang("groupNotApproved"));
				}

				await threadsData.set(threadID, false, "data.groupApproved");
				return message.reply(getLang("approvalRemoved", threadData.threadName || "Unknown", threadID));
			} catch (err) {
				console.error("Error removing approval:", err);
				return message.reply(getLang("errorGettingGroupInfo"));
			}
		}

		// Approve group
		const threadID = subcommand;
		if (isNaN(threadID)) {
			return message.reply(getLang("invalidThreadId"));
		}

		try {
			// Get or create thread data
			let threadData;
			try {
				threadData = await threadsData.get(threadID);
			} catch (err) {
				// If thread doesn't exist in database, try to get info from Facebook
				try {
					const threadInfo = await api.getThreadInfo(threadID);
					threadData = await threadsData.create(threadID, threadInfo);
				} catch (createErr) {
					return message.reply(getLang("errorGettingGroupInfo"));
				}
			}

			// Check if already approved
			if (threadData.data.groupApproved === true) {
				return message.reply(getLang("groupAlreadyApproved"));
			}

			// Approve the group
			await threadsData.set(threadID, true, "data.groupApproved");
			
			return message.reply(getLang("groupApproved", threadData.threadName || "Unknown", threadID));
		} catch (err) {
			console.error("Error approving group:", err);
			return message.reply(getLang("errorGettingGroupInfo"));
		}
	}
};

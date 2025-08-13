// onEvent.js
// This module loops through all registered event handlers in global.GoatBot.onEvent
// and executes them safely, supporting async handlers and parallel execution.

const allOnEvent = global.GoatBot?.onEvent || [];

module.exports = {
	config: {
		name: "onEvent",
		version: "1.3",
		author: "eran",
		description: "Runs all registered events in global.GoatBot.onEvent when a new event is received",
		category: "events"
	},

	onStart: async (context) => {
		// Check that we have a valid events array
		if (!Array.isArray(allOnEvent) || allOnEvent.length === 0) {
			console.warn("[onEvent] No event handlers registered.");
			return;
		}

		// Execute all handlers in parallel, logging errors individually
		await Promise.allSettled(
			allOnEvent.map(async (item) => {
				// Skip if item is just a string (command name reference)
				if (typeof item === "string") return;

				// Check if item has a callable onStart function
				if (item && typeof item.onStart === "function") {
					const handlerName = item.config?.name || "unknown";
					const startTime = Date.now();
					try {
						await item.onStart(context);
						const endTime = Date.now();
						console.log(`[onEvent] Handler "${handlerName}" completed in ${endTime - startTime}ms`);
					} catch (err) {
						console.error(`[onEvent] Error in handler "${handlerName}":`, err);
					}
				}
			})
		);
	}
};

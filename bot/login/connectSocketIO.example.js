const { io } = require('socket.io-client');

// ===== Configuration =====
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001'; // Use env var or default
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'Fn96OxLwWEfENTPYPAiXqwdieaIsn4Y5OH2APP0O';
const CHANNEL = process.env.SOCKET_CHANNEL || 'uptime';

// ===== Socket Connection =====
const socket = io(SOCKET_URL, {
	query: { verifyToken: VERIFY_TOKEN },
	reconnection: true, // Enable auto-reconnect
	reconnectionAttempts: 10, // Max attempts
	reconnectionDelay: 2000, // 2s delay between attempts
	timeout: 10000, // Connection timeout
	transports: ['websocket'] // Force WebSocket for stability
});

// ===== Event Handlers =====
socket.on('connect', () => {
	console.log(`[✅ Connected] Socket connected to ${SOCKET_URL}`);
});

socket.on('disconnect', reason => {
	console.log(`[⚠️ Disconnected] Reason: ${reason}`);
});

socket.on('connect_error', err => {
	console.error(`[❌ Connection Error] ${err.message || err}`);
});

socket.on('reconnect_attempt', attempt => {
	console.log(`[🔄 Reconnect Attempt] Attempt ${attempt}`);
});

socket.on('reconnect_failed', () => {
	console.error(`[🚫 Reconnect Failed] Could not reconnect to ${SOCKET_URL}`);
});

socket.on(CHANNEL, data => {
	console.log(`[📡 Data from "${CHANNEL}"]:`, data);
});

// ===== Graceful Shutdown =====
process.on('SIGINT', () => {
	console.log('\n[⏹ Closing Connection]');
	socket.close();
	process.exit(0);
});

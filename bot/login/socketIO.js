/**
 * Socket.IO server module for GoatBot uptime monitoring
 * This module will be called if enabled in config (serverUptime.socket.enable = true)
 * @example See ./connectSocketIO.example.js
 */
const { Server } = require("socket.io");
const { log, getText } = global.utils;
const { config } = global.GoatBot;

module.exports = async (server) => {
    const { channelName, verifyToken } = config.serverUptime.socket || {};
    let io;

    // Validate config
    if (!channelName) {
        return log.err("SOCKET IO", getText("socketIO", "error"), '"channelName" is not defined in config');
    }
    if (!verifyToken) {
        return log.err("SOCKET IO", getText("socketIO", "error"), '"verifyToken" is not defined in config');
    }

    try {
        io = new Server(server);
        log.info("SOCKET IO", getText("socketIO", "connected"));
    } catch (err) {
        return log.err("SOCKET IO", getText("socketIO", "error"), err);
    }

    io.on("connection", (socket) => {
        const token = socket.handshake.query?.verifyToken;

        // Validate token
        if (token !== verifyToken) {
            socket.emit(channelName, {
                status: "error",
                message: "Token is invalid"
            });
            socket.disconnect(true);
            log.warn("SOCKET IO", `Client ${socket.id} provided invalid token`);
            return;
        }

        log.info("SOCKET IO", `New client connected: ${socket.id}`);
        socket.emit(channelName, {
            status: "success",
            message: "Connected to server successfully"
        });

        socket.on("disconnect", (reason) => {
            log.info("SOCKET IO", `Client disconnected: ${socket.id} | Reason: ${reason}`);
        });
    });

    // Optional: handle server-side errors
    io.on("error", (err) => {
        log.err("SOCKET IO", "Socket.IO server error", err);
    });
};

import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Connect to backend WebSocket server

export default socket;

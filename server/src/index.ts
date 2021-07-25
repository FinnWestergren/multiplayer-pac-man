import http from 'http';
import nodeStatic from 'node-static';
import crypto from 'crypto';
import { handleMessage, getCurrentMap } from './serverExtensions';
import { ServerMessage, ClientMessage, MessageType, removePlayer, runGame, generateGuid, initPlayer, gameReducer } from "core";
import { createStore } from "redux";
import {Socket} from "net"
import { serverStateReducer } from './ducks/serverState';

const file = new nodeStatic.Server('./');
const serverId = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const port = 8080;
const server = http.createServer((req, res) => {
	req.addListener('end', () => file.serve(req, res)).resume();
});
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

export const Store = createStore(gameReducer);
export const ServerStore = createStore(serverStateReducer);

let socketList: { [key: string]: Socket } = {};
runGame(Store, setInterval);

const generateHash = (acceptKey: string) => crypto
	.createHash('sha1')
	.update(acceptKey + serverId)
	.digest('base64');

server.on('upgrade', function (req, socket: Socket) {
	// Make sure that we only handle WebSocket upgrade requests
	if (req.headers['upgrade'] !== 'websocket') {
		socket.end('HTTP/1.1 400 Bad Request');
		return;
	}
	const acceptKey = req.headers['sec-websocket-key']; // Read the websocket key provided by the client: 
	const hash = generateHash(acceptKey); // Generate the response value to use in the response: 
	// Write the HTTP response into an array of response lines: 
	const responseHeaders = ['HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}`];
	const protocol = req.headers['sec-websocket-protocol']; // Read the subprotocol from the client request headers:
	const protocols = !protocol ? [] : protocol.split(',').map((s: string) => s.trim());
	if (protocols.includes('json')) {
		// Tell the client that we agree to communicate with JSON data
		responseHeaders.push(`Sec-WebSocket-Protocol: json`);
	}
	// Write the response back to the client socket, being sure to append two 
	// additional newlines so that the browser recognises the end of the response 
	// header and doesn't continue to wait for more header data: 
	socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
	const playerId = generateGuid();
	socket.on('data', (buffer: Buffer) => handleData(buffer, playerId));
	socket.on('close', () => console.log("closing from socket"));
	socketList[playerId] = socket;
	addPlayerEverywhere(playerId);
});

server.on('connection', () => console.log("connected"));
server.on('close', () => console.log("closing"));

function handleData(buffer: Buffer, playerId: string) {
	const parsedBuffer = parseBuffer(buffer);
	if (parsedBuffer) {
		setTimeout(() => {
			handleMessage(parsedBuffer, playerId);
		}, (ServerStore.getState().simulatedLag[playerId] ?? 0) * 0.5);
	} else if (parsedBuffer === null) {
		console.log('WebSocket connection closed by the client.');
		removePlayerEverywhere(playerId);
	}
};

export const writeToAllPlayers = (message: ServerMessage, retryLimit: number = 0, excludeId?: string ) => {
	Object.keys(socketList).filter(pId => pId !== excludeId).forEach(playerId => {
		writeToSinglePlayer(message, playerId, retryLimit);
	});
};

export const writeToSinglePlayer = (message: ServerMessage, playerId: string, retryLimit: number = 0 ) => {
	setTimeout(() => {
		try {
			socketList[playerId].write(constructMessage(message));
		}
		catch (e) {
			console.log(`player ${playerId} appears to have disconnected`);
			if (e.code === 'ERR_STREAM_DESTROYED') {
				removePlayerEverywhere(playerId);
			}
			else if (retryLimit > 0) {
				console.log('retrying send');
				writeToSinglePlayer(message, playerId, retryLimit-1);
			}
		}
	}, (ServerStore.getState().simulatedLag[playerId] ?? 0) * 0.5);
}

const addPlayerEverywhere = (playerId: string) => {
	const championId = generateGuid();
	initPlayer(Store, playerId, championId);
	writeToSinglePlayer({ type: MessageType.MAP_RESPONSE, payload: getCurrentMap() }, playerId);
	writeToSinglePlayer({ type: MessageType.INIT_PLAYER, payload: { currentPlayerId: playerId, actorState: Store.getState().actorState }}, playerId);
	writeToAllPlayers({ type: MessageType.ADD_PLAYER, payload: { playerId, championId} }, 2, playerId);
}

const removePlayerEverywhere = (playerId: string) => {
	removePlayer(Store, playerId);
	socketList[playerId].end();
	socketList[playerId].destroy();
	delete socketList[playerId];
	writeToAllPlayers({ type: MessageType.REMOVE_PLAYER, payload: playerId }, 10);
}

function parseBuffer(buffer: Buffer): ClientMessage | null | undefined {
	const firstByte = buffer.readUInt8(0);
	const isFinalFrame = Boolean((firstByte >>> 7) & 1); // keeping this here in case we need to persist data between frames (shouldn't need to as far as I know)
	// we can generally ignore reserve bits
	const [reserved1, reserved2, reserved3] = [Boolean((firstByte >>> 6) & 1), Boolean((firstByte >>> 5) & 1), Boolean((firstByte >>> 4) & 1)];
	const opCode = firstByte & 15;
	// This is a connection termination frame 
	if (opCode === 8) {
		return null;
	}
	// We only care about text frames from this point onward 
	if (opCode !== 1) {
		return undefined;
	}
	const secondByte = buffer.readUInt8(1);
	const isMasked = Boolean((secondByte >>> 7) & 1);
	// Keep track of our current position as we advance through the buffer 
	let currentOffset = 2;
	let payloadLength = secondByte & 127;
	if (payloadLength > 125) {
		if (payloadLength === 126) {
			payloadLength = buffer.readUInt16BE(currentOffset);
			currentOffset += 2;
		} else {
			throw new Error('Large payloads not currently implemented');
		}
	}

	// Allocate somewhere to store the final message data
	// Only unmask the data if the masking bit was set to 1
	const data = Buffer.alloc(payloadLength);

	let maskingKey: number;
	if (isMasked) {
		maskingKey = buffer.readUInt32BE(currentOffset);
		currentOffset += 4;
		// Loop through the source buffer one byte at a time, keeping track of which
		// byte in the masking key to use in the next XOR calculation
		for (let i = 0, j = 0; i < payloadLength; ++i, j = i % 4) {
			// Extract the correct byte mask from the masking key
			const shift = j === 3 ? 0 : (3 - j) << 3;
			const mask = (shift == 0 ? maskingKey : (maskingKey >>> shift)) & 0xFF;
			// Read a byte from the source buffer 
			const source = buffer.readUInt8(currentOffset++);
			// XOR the source byte and write the result to the data 
			data.writeUInt8(mask ^ source, i);
		}
	}
	else {
		buffer.copy(data, 0, currentOffset++);
	}
	return JSON.parse(data.toString('utf8'));
}

function constructMessage(message: ServerMessage) {
	// Convert the data to JSON and copy it into a buffer
	const json = JSON.stringify(message)
	const jsonByteLength = Buffer.byteLength(json);
	// Note: we're not supporting > 65535 byte payloads at this stage 
	const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
	const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
	const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength);
	// Write out the first byte, using opcode `1` to indicate that the message 
	// payload contains text data 
	buffer.writeUInt8(0b10000001, 0);
	buffer.writeUInt8(payloadLength, 1);
	// Write the length of the JSON payload to the second byte 
	let payloadOffset = 2;
	if (lengthByteCount > 0) {
		buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount;
	}
	// Write the JSON data to the data buffer 
	buffer.write(json, payloadOffset);
	return buffer;
};

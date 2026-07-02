import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 5,
  reconnectionDelayMax: 1000,
})

export default socket
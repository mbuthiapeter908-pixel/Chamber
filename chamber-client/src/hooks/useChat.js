import { useState, useEffect, useCallback, useRef } from 'react'
import socket from '../services/socket'

const API_URL = 'http://localhost:5000/api'

let isSocketSetup = false // Module-level flag

export function useChat(username) {
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const usernameRef = useRef(username)
  const messagesRef = useRef([])

  // Keep refs in sync
  useEffect(() => {
    usernameRef.current = username
  }, [username])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const loadMessageHistory = useCallback(async (roomName) => {
    if (!roomName) return
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`${API_URL}/messages/${roomName}`)
      const data = await response.json()
      const historyMessages = data.messages.map((msg) => ({
        ...msg,
        room: msg.roomName || roomName,
        roomId: msg.roomId || roomName,
        isOwn: msg.sender?.username === usernameRef.current,
      }))
      setMessages((prev) => {
        const otherMessages = prev.filter((m) => {
          const msgRoom = m.room || m.roomId || m.roomName || ''
          return msgRoom !== roomName
        })
        return [...otherMessages, ...historyMessages]
      })
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Set up socket listeners ONCE
  useEffect(() => {
    if (isSocketSetup) return
    isSocketSetup = true

    if (!socket.connected) {
      socket.connect()
    }

    const onConnect = () => {
      console.log('✅ Connected:', usernameRef.current)
      setIsConnected(true)
      if (usernameRef.current) {
        socket.emit('user-online', { username: usernameRef.current })
      }
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    const onNewMessage = (message) => {
      const currentMessages = messagesRef.current
      const exists = currentMessages.find((m) => m._id === message._id)
      if (exists) return

      console.log('📩 New message:', message.text)
      setMessages((prev) => [...prev, {
        ...message,
        isOwn: message.sender?.username === usernameRef.current,
      }])
    }

    const onOnlineUsers = (users) => setOnlineUsers(users)

    const onUserTyping = ({ username: typingUser, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, typingUser])])
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== typingUser))
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('new-message', onNewMessage)
    socket.on('online-users', onOnlineUsers)
    socket.on('user-typing', onUserTyping)

    // Trigger if already connected
    if (socket.connected && usernameRef.current) {
      socket.emit('user-online', { username: usernameRef.current })
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('new-message', onNewMessage)
      socket.off('online-users', onOnlineUsers)
      socket.off('user-typing', onUserTyping)
      isSocketSetup = false
    }
  }, [])

  const sendMessage = useCallback((text, roomId) => {
    socket.emit('send-message', { roomId, text })
  }, [])

  const joinRoom = useCallback((roomId) => {
    socket.emit('join-room', { roomId })
    loadMessageHistory(roomId)
  }, [loadMessageHistory])

  const leaveRoom = useCallback((roomId) => {
    socket.emit('leave-room', { roomId })
  }, [])

  const markAsRead = useCallback((messageId) => {
    socket.emit('mark-read', { messageId })
  }, [])

  const addReaction = useCallback((messageId, emoji) => {
    socket.emit('add-reaction', { messageId, emoji })
  }, [])

  const startTyping = useCallback((roomId) => {
    socket.emit('typing-start', { roomId, username: usernameRef.current })
  }, [])

  const stopTyping = useCallback((roomId) => {
    socket.emit('typing-stop', { roomId, username: usernameRef.current })
  }, [])

  return {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoadingHistory,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    addReaction,
    joinRoom,
    leaveRoom,
  }
}
import React, { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { useChat } from '../../../hooks/useChat'

function ChatArea({ username, activeRoom,dmRooms = [] }) {
  const {
    messages,
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
  } = useChat(username)

  const messagesEndRef = useRef(null)
  const prevRoomRef = useRef(activeRoom)

  useEffect(() => {
    if (prevRoomRef.current !== activeRoom) {
      leaveRoom(prevRoomRef.current)
      joinRoom(activeRoom)
      prevRoomRef.current = activeRoom
    } else {
      joinRoom(activeRoom)
    }
    return () => { leaveRoom(activeRoom) }
  }, [activeRoom, joinRoom, leaveRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (text) => sendMessage(text, activeRoom)
  const handleReaction = (messageId, emoji) => addReaction(messageId, emoji)

 const roomMessages = messages.filter((msg) => {
    const msgRoom = msg.room?.name || msg.room || msg.roomId || msg.roomName || ''
    return msgRoom === activeRoom
  })

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-chamber-50 to-white">
      <div className="bg-white/80 backdrop-blur-sm border-b border-chamber-200/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-30 h-10 bg-gradient-to-br from-chamber-400 to-chamber-500 rounded-xl flex items-center justify-center shadow-md shadow-chamber-200">
              <span className="text-white font-bold text-lg">{activeRoom.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              
        <h2 className="text-lg font-semibold text-slate-800">
  {(() => {
    const dmRoom = dmRooms?.find(r => r.name === activeRoom);
    if (dmRoom) {
      return (
        <span className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {dmRoom.displayName?.[0]?.toUpperCase()}
          </span>
          @{dmRoom.displayName}
        </span>
      );
    }
    return `# ${activeRoom}`;
  })()}
</h2>
       
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-chamber-400 font-medium">
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-3">
                <span className="w-2 h-2 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-sm text-chamber-400">Loading messages...</p>
            </div>
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-chamber-100 to-chamber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-10 h-10 text-chamber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-chamber-700 mb-1">Welcome to #{activeRoom}</h3>
              <p className="text-sm text-chamber-400">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          roomMessages.map((msg) => (
            <MessageBubble
              key={msg._id || Math.random()}
              message={{
                ...msg,
                sender: msg.sender?.username || msg.sender || 'Unknown',
                text: msg.text,
                timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                isOwn: msg.sender?.username === username || msg.sender === username,
              }}
              onReaction={(emoji) => handleReaction(msg._id, emoji)}
              onRead={() => markAsRead(msg._id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={() => startTyping(activeRoom)}
        onTypingStop={() => stopTyping(activeRoom)}
      />
    </div>
  )
}

export default ChatArea
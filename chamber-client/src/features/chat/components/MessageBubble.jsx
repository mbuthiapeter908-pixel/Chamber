import React, { useState } from 'react'

const emojis = ['👍', '❤️', '😄', '🎉', '🚀', '👏', '🔥', '💯']

function MessageBubble({ message, onReaction, onRead }) {
  const [showReactions, setShowReactions] = useState(false)
  const [showReadReceipt, setShowReadReceipt] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleReactionClick = (emoji) => {
    onReaction(emoji)
    setShowReactions(false)
  }

  return (
    <div
      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}
      onMouseEnter={() => { setIsHovered(true); setShowReactions(true) }}
      onMouseLeave={() => { setIsHovered(false); setShowReactions(false); setShowReadReceipt(false) }}
    >
      <div className={`flex items-end gap-2 max-w-[72%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <div className="w-7 h-7 bg-gradient-to-br from-chamber-300 to-chamber-400 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white">
              {message.sender?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        {/* Message content */}
        <div className="relative">
          {/* Sender name */}
          {!message.isOwn && (
            <p className="text-xs text-chamber-400 ml-1 mb-0.5 font-medium">
              {message.sender}
            </p>
          )}

          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
              message.isOwn
                ? 'bg-gradient-to-br from-chamber-400 to-chamber-500 text-white rounded-br-md shadow-chamber-200/50'
                : 'bg-white text-chamber-800 rounded-bl-md border border-chamber-100 shadow-chamber-100/50'
            } ${isHovered ? 'shadow-md' : ''}`}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          </div>

          {/* Timestamp & Read receipt */}
          <div className={`flex items-center gap-2 mt-0.5 ${message.isOwn ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
            <span className="text-[10px] text-chamber-400 font-medium">
              {message.timestamp}
            </span>
            {message.isOwn && (
              <button
                onClick={() => { setShowReadReceipt(!showReadReceipt); onRead?.() }}
                className="text-[10px] text-chamber-300 hover:text-chamber-500 transition-colors"
              >
                {message.readBy?.length > 0 ? `Read by ${message.readBy.length}` : 'Sent'}
              </button>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 flex-wrap ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((r, idx) => (
                <span
                  key={idx}
                  className="bg-white/90 backdrop-blur-sm border border-chamber-200 rounded-full px-8 py-0.5 text-xs shadow-sm hover:scale-110 transition-transform cursor-default"
                  title={r.user?.username || 'User'}
                >
                  {r.emoji || r}
                </span>
              ))}
            </div>
          )}

          {/* Reaction picker */}
          {showReactions && (
            <div
              className={`absolute -top-11 ${message.isOwn ? 'right-0' : 'left-0'} bg-white border border-chamber-200 rounded-2xl px-2 py-1.5 shadow-xl flex gap-0.5 z-20 animate-in slide-in-from-bottom-2 duration-200`}
            >
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-chamber-50 hover:scale-125 transition-all duration-150 text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
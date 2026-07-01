import React, { useState, useRef } from 'react'

function MessageInput({ onSendMessage, onTypingStart, onTypingStop }) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      onTypingStart?.()
    }
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTypingStop?.()
    }, 1500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      setIsTyping(false)
      onTypingStop?.()
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border-t border-chamber-200/60 px-4 py-3">
      {/* Typing indicator bar */}
      {isTyping && (
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
            <span className="w-1.5 h-1.5 bg-chamber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
          </div>
          <span className="text-xs text-chamber-400 font-medium">Typing...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={`flex items-end gap-2 p-1.5 rounded-2xl transition-all duration-300 ${
          isFocused 
            ? 'bg-white ring-2 ring-chamber-400/30 shadow-lg shadow-chamber-100' 
            : 'bg-chamber-50 border border-chamber-200/60 hover:border-chamber-300/60'
        }`}>
          {/* Attachment button */}
          <button
            type="button"
            className="p-2.5 rounded-xl hover:bg-chamber-100/60 transition-all duration-200 hover:scale-105 group flex-shrink-0"
            title="Attach file"
          >
            <svg className="w-5 h-5 text-chamber-400 group-hover:text-chamber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Write a message..."
              className="w-full px-2 py-2.5 bg-transparent text-chamber-800 placeholder-chamber-300 text-sm outline-none"
              maxLength={5000}
            />
          </div>

          {/* Emoji button */}
          <button
            type="button"
            className="p-2.5 rounded-xl hover:bg-chamber-100/60 transition-all duration-200 hover:scale-105 group flex-shrink-0"
            title="Add emoji"
          >
            <svg className="w-5 h-5 text-chamber-400 group-hover:text-chamber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
              message.trim()
                ? 'bg-gradient-to-br from-chamber-400 to-chamber-500 text-white shadow-md shadow-chamber-200 hover:shadow-lg hover:shadow-chamber-300 hover:scale-105 active:scale-95'
                : 'bg-chamber-100 text-chamber-300 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Character count */}
      {message.length > 4500 && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${message.length > 4900 ? 'text-red-400' : 'text-chamber-400'}`}>
            {message.length}/5000
          </span>
        </div>
      )}
    </div>
  )
}

export default MessageInput
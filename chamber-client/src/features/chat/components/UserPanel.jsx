import React, { useEffect, useState } from 'react'
import socket from '../../../services/socket'

function UserPanel({ isOpen, onClose }) {
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const handleUsers = (users) => {
      setOnlineUsers(users || [])
    }

    socket.on('online-users', handleUsers)

    if (isOpen) {
      socket.emit('get-online-users')
    }

    return () => {
      socket.off('online-users', handleUsers)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const getInitials = (name) => {
    return name?.slice(0, 2).toUpperCase() || '?'
  }

  const getAvatarColor = (name) => {
    const colors = [
      'from-chamber-400 to-chamber-500',
      'from-sky-400 to-sky-500',
      'from-emerald-400 to-emerald-500',
      'from-violet-400 to-violet-500',
      'from-amber-400 to-amber-500',
      'from-rose-400 to-rose-500',
      'from-cyan-400 to-cyan-500',
      'from-indigo-400 to-indigo-500',
    ]
    let hash = 0
    for (let i = 0; i < (name?.length || 0); i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-slate-800">Online</h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
              {onlineUsers.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
            type="button"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3">
          {onlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No one online</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {onlineUsers.map((user, idx) => (
                <div
                  key={user._id || idx}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(user.username)} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}>
                      <span className="text-sm font-bold text-white">
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{user.username}</p>
                    <p className="text-xs text-emerald-500 font-medium">Online</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <p className="text-xs text-slate-400 text-center font-medium">Chamber — Real-time Chat</p>
        </div>
      </div>
    </>
  )
}

export default UserPanel
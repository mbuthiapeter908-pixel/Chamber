import React, { useState, useEffect, useRef } from 'react'
import socket from '../../../services/socket'

function RoomSidebar({ activeRoom, onRoomChange }) {
  const [rooms, setRooms] = useState([
    { name: 'general', unread: 0 },
    { name: 'random', unread: 0 },
    {name: 'Home' , unread: 0},
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDescription, setNewRoomDescription] = useState('')
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    socket.emit('get-rooms')

    socket.on('room-list', (roomList) => {
      if (roomList && roomList.length > 0) {
        const formatted = roomList.map((r) => ({
          name: r.name,
          unread: 0,
          id: r._id,
          description: r.description || '',
        }))
        setRooms(formatted)
      }
    })

    socket.on('room-created', (room) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.name === room.name)
        if (exists) return prev
        return [...prev, { name: room.name, unread: 0, id: room._id, description: room.description || '' }]
      })
      setShowCreateModal(false)
      setNewRoomName('')
      setNewRoomDescription('')
      setIsCreating(false)
    })

    socket.on('room-error', (err) => {
      setError(err.error)
      setIsCreating(false)
    })

    return () => {
      socket.off('room-list')
      socket.off('room-created')
      socket.off('room-error')
    }
  }, [])

  useEffect(() => {
    if (showCreateModal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showCreateModal])

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false)
        setError('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showCreateModal])

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowCreateModal(false)
        setError('')
      }
    }
    if (showCreateModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCreateModal])

  const handleCreateRoom = () => {
    const roomName = newRoomName.trim().toLowerCase()
    if (roomName.length < 2) {
      setError('Room name must be at least 2 characters')
      return
    }
    if (roomName.length > 30) {
      setError('Room name must be 30 characters or less')
      return
    }
    setError('')
    setIsCreating(true)
    socket.emit('create-room', { 
      name: roomName, 
      userId: socket.id,
      description: newRoomDescription.trim(),
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateRoom()
    }
  }

  return (
    <>
      <aside className="w-60 bg-white border-r border-slate-200/60 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Channels
            </h2>
          </div>
        </div>

        {/* Room List */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {rooms.map((room) => (
            <button
              key={room.name}
              onClick={() => onRoomChange(room.name)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                activeRoom === room.name
                  ? 'bg-gradient-to-r from-chamber-50 to-sky-50 text-chamber-700 font-semibold border border-chamber-200/50 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`text-base font-medium ${
                  activeRoom === room.name ? 'text-chamber-500' : 'text-slate-400'
                } group-hover:text-chamber-500 transition-colors flex-shrink-0`}>
                  #
                </span>
                <div className="min-w-0">
                  <span className="text-sm truncate block">{room.name}</span>
                  {room.description && (
                    <span className="text-[10px] text-slate-400 truncate block">{room.description}</span>
                  )}
                </div>
              </div>
              {room.unread > 0 && (
                <span className="bg-chamber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm flex-shrink-0">
                  {room.unread > 99 ? '99+' : room.unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Create Room Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => {
              setShowCreateModal(true)
              setNewRoomName('')
              setNewRoomDescription('')
              setError('')
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-chamber-500 to-sky-500 text-white rounded-xl font-medium text-sm hover:from-chamber-600 hover:to-sky-600 transition-all duration-200 shadow-md shadow-chamber-200/50 hover:shadow-lg hover:shadow-chamber-300/50 active:scale-[0.98] group"
          >
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Channel
          </button>
        </div>

        {/* Connection Status */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
        </div>
      </aside>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          {/* Modal */}
          <div
            ref={modalRef}
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-chamber-500 to-sky-500 px-6 py-4">
              <h3 className="text-white font-semibold text-lg">Create Channel</h3>
              <p className="text-white/70 text-sm mt-0.5">Start a new conversation space</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Channel Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg"></span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newRoomName}
                    onChange={(e) => { setNewRoomName(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. design-team"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-chamber-400 focus:border-transparent text-slate-800 placeholder-slate-400 text-sm transition-all"
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description <span className="text-slate-300 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-chamber-400 focus:border-transparent text-slate-800 placeholder-slate-400 text-sm transition-all"
                  maxLength={200}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setError('')
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating || !newRoomName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-chamber-500 to-sky-500 text-white rounded-xl font-medium text-sm hover:from-chamber-600 hover:to-sky-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md shadow-chamber-200/50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Channel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default RoomSidebar
import React, { useState, useEffect, useRef } from 'react'
import socket from '../../../services/socket'

function RoomSidebar({ activeRoom, onRoomChange }) {
  const [rooms, setRooms] = useState([
    { name: 'general', unread: 0 },
    { name: 'random', unread: 0 },
  ])
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    socket.emit('get-rooms')

    socket.on('room-list', (roomList) => {
      if (roomList && roomList.length > 0) {
        const formatted = roomList.map((r) => ({
          name: r.name,
          unread: 0,
          id: r._id,
        }))
        setRooms(formatted)
      }
    })

    socket.on('room-created', (room) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.name === room.name)
        if (exists) return prev
        return [...prev, { name: room.name, unread: 0, id: room._id }]
      })
      setShowCreateRoom(false)
      setNewRoomName('')
      setError('')
    })

    socket.on('room-error', (err) => {
      setError(err.error)
    })

    return () => {
      socket.off('room-list')
      socket.off('room-created')
      socket.off('room-error')
    }
  }, [])

  useEffect(() => {
    if (showCreateRoom && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showCreateRoom])

  const handleCreateRoom = () => {
    const roomName = newRoomName.trim().toLowerCase()
    if (roomName.length < 2) {
      setError('Room name must be at least 2 characters')
      return
    }
    setError('')
    socket.emit('create-room', { name: roomName, userId: socket.id })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateRoom()
    }
    if (e.key === 'Escape') {
      setShowCreateRoom(false)
      setNewRoomName('')
      setError('')
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-chamber-200 flex flex-col">
      <div className="p-4 border-b border-chamber-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Channels
          </h2>
          <button
            onClick={() => {
              setShowCreateRoom(!showCreateRoom)
              setNewRoomName('')
              setError('')
            }}
            className="w-7 h-7 bg-slate-100 hover:bg-chamber-100 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            title="Create channel"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {showCreateRoom && (
          <div className="mb-2 space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={newRoomName}
              onChange={(e) => { setNewRoomName(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="Channel name..."
              className="w-full h-10 px-5 py-2 text-sm border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-chamber-400 focus:border-transparent bg-slate-50 text-slate-700 placeholder-slate-400 transition-all"
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex gap-1">
              <button
                onClick={handleCreateRoom}
                className="flex-1 bg-chamber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-chamber-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateRoom(false)
                  setNewRoomName('')
                  setError('')
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
                
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rooms.map((room) => (
          <button
            key={room.name}
            onClick={() => onRoomChange(room.name)}
            className={`w-full h-5 text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
              activeRoom === room.name
                ? 'bg-gradient-to-r from-chamber-100 to-chamber-50 text-chamber-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${activeRoom === room.name ? 'text-chamber-500' : 'text-slate-400'} group-hover:text-chamber-500 transition-colors`}>#</span>
              <span className="text-sm">{room.name}</span>
            </div>
            {room.unread > 0 && (
              <span className="bg-chamber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
                {room.unread > 99 ? '99+' : room.unread}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>Connected</span>
        </div>
      </div>
    </aside>
  )
}

export default RoomSidebar
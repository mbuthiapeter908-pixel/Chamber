import React, { useState, useEffect, useRef } from 'react'
import LoginScreen from './features/auth/components/LoginScreen'
import ChatArea from './features/chat/components/ChatArea'
import RoomSidebar from './features/rooms/components/RoomSidebar'
import UserPanel from './features/chat/components/UserPanel'
import socket from './services/socket'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [activeRoom, setActiveRoom] = useState('general')
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [dmRooms, setDmRooms] = useState([])
  const dmRoomsRef = useRef(dmRooms)
  const activeRoomRef = useRef(activeRoom)

  // Keep refs in sync
  useEffect(() => {
    dmRoomsRef.current = dmRooms
  }, [dmRooms])

  useEffect(() => {
    activeRoomRef.current = activeRoom
  }, [activeRoom])

  useEffect(() => {
    // Wait for socket to connect before setting up listeners
    const setupListeners = () => {
      socket.on('private-room-created', (data) => {
        console.log('📩 FULL DM data:', JSON.stringify(data))
        
        const dmRoom = {
          name: data.room.name,
          displayName: data.room.displayName || 'User',
          isPrivate: data.room.isPrivate || true,
          id: data.room.id,
        }
        
        console.log('📦 Processed DM room:', dmRoom)
        
        setDmRooms((prev) => {
          const exists = prev.find((r) => r.name === dmRoom.name)
          if (exists) {
            setActiveRoom(dmRoom.name)
            return prev
          }
          setActiveRoom(dmRoom.name)
          return [...prev, dmRoom]
        })
      })
    }

    if (socket.connected) {
      setupListeners()
    } else {
      socket.once('connect', setupListeners)
    }

    return () => {
      socket.off('private-room-created')
    }
  }, [])

  const handleLogin = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-chamber-50 flex items-center justify-center p-4">
        <LoginScreen onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chamber-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-chamber-200/60 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-chamber-400 to-chamber-500 rounded-xl flex items-center justify-center shadow-md shadow-chamber-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Chamber</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium hidden sm:block">
              {username}
            </span>
            
            <button
              onClick={() => setShowUserPanel(!showUserPanel)}
              className={`relative p-2 rounded-xl transition-all duration-200 ${
                showUserPanel 
                  ? 'bg-chamber-100 text-chamber-600 shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
              title="Online users"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors font-medium hidden sm:block"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <RoomSidebar 
          activeRoom={activeRoom} 
          onRoomChange={setActiveRoom}
          dmRooms={dmRooms}
        />

        <div className="flex-1 flex flex-col">
          <ChatArea 
            username={username} 
            activeRoom={activeRoom}
            dmRooms={dmRooms}
          />
        </div>

        <UserPanel 
          isOpen={showUserPanel} 
          onClose={() => setShowUserPanel(false)}
          currentUsername={username}
        />
      </div>
    </div>
  )
}

export default App
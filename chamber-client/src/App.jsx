import React, { useState } from 'react'
import LoginScreen from './features/auth/components/LoginScreen'
import ChatArea from './features/chat/components/ChatArea'
import RoomSidebar from './features/rooms/components/RoomSidebar'
import UserList from './features/chat/components/UserList'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [activeRoom, setActiveRoom] = useState('general')

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
      <header className="bg-white border-b border-chamber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-chamber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-chamber-800">Chamber</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-chamber-600 bg-chamber-100 px-3 py-1 rounded-full">
              {username}
            </span>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-sm text-chamber-500 hover:text-chamber-700 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <RoomSidebar 
          activeRoom={activeRoom} 
          onRoomChange={setActiveRoom} 
        />

        <div className="flex-1 flex flex-col">
          <ChatArea 
            username={username} 
            activeRoom={activeRoom} 
          />
        </div>

        <div className="hidden lg:block">
          <UserList />
        </div>
      </div>
    </div>
  )
}

export default App

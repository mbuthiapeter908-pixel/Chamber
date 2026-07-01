import React from 'react'
import { useChat } from '../../../hooks/useChat'

function UserList() {
  const { onlineUsers } = useChat('')

  return (
    <aside className="w-64 bg-white border-l border-chamber-200 flex flex-col">
      <div className="p-4 border-b border-chamber-100">
        <h2 className="text-sm font-semibold text-chamber-700 uppercase tracking-wider">
          Online people {onlineUsers.length}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-chamber-400 text-center py-4">No users online</p>
        ) : (
          onlineUsers.map((user, idx) => (
            <div
              key={user._id || idx}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-chamber-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-chamber-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-chamber-700">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-sm text-chamber-700">{user.username}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

export default UserList
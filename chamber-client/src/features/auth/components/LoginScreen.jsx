import React, { useState } from 'react'

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    if (trimmed.length > 20) {
      setError('Name must be 20 characters or less')
      return
    }
    setError('')
    onLogin(trimmed)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-chamber-50 to-sky-50 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZWE1ZTkiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-chamber-200/20 to-sky-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-200/20 to-chamber-200/20 rounded-full blur-3xl"></div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="bg-lightwhite/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-chamber-200/30 border border-white/60 p-10">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-br from-chamber-400 to-sky-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-chamber-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-chamber-00/40">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight ">Chamber</h1>
            <p className="text-slate-400 mt-6 text-xl font-medium">infinite chatting</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-900 mb-6 ml-1"
              >
             Username
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  isFocused
                    ? 'ring-2 ring-chamber-400/30 rounded-2xl'
                    : ''
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isFocused ? 'text-chamber-500' : 'text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter your name"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-800 rounded-2xl focus:outline-none focus:border-chamber-400 focus:bg-blue-50 text-slate-800 placeholder-slate-400 text-sm font-large transition-all duration-300 placeholder:text-center font-bold"
                  autoFocus
                  maxLength={20}
                />
                {name.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setName(''); setError('') }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 ml-1">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-chamber-500 to-sky-600 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-chamber-300/30 hover:shadow-xl hover:shadow-chamber-400/40 active:scale-[0.98] disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-1">
                Join Chat
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isHovered && name.trim() ? 'translate-x-1' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          </div>

          {/* Feature list - clean and minimal */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-8 h-8 bg-gradient-to-br from-chamber-100 to-chamber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-chamber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Real-time messaging</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Private conversations</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Organized channels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
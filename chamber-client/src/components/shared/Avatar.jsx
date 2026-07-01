function Avatar({ name, size = 'md', status }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-300',
    idle: 'bg-yellow-400',
  }

  const statusSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }

  return (
    <div className="relative inline-flex">
      <div className={`${sizeClasses[size]} bg-chamber-200 rounded-full flex items-center justify-center font-medium text-chamber-700`}>
        {name?.[0]?.toUpperCase() || '?'}
      </div>
      {status && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} ${statusColors[status]} rounded-full border-2 border-white`}></div>
      )}
    </div>
  )
}

export default Avatar
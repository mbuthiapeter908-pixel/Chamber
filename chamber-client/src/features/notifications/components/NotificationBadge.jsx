function NotificationBadge({ count, children }) {
  return (
    <div className="relative inline-flex">
      {children}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}

export default NotificationBadge
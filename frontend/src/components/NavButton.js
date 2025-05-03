import React from 'react'
import { Link } from 'react-router-dom'

export default function NavButton({ to, children, badge = 0 }) {
  return (
    <Link to={to} className="relative inline-block">
      <button className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
        {children}
      </button>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1">
          {badge}
        </span>
      )}
    </Link>
  )
}

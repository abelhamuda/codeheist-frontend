import React from 'react'

const Header = () => {
  return (
    <header className="py-6 border-b border-hacker-green/30">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-hacker-green animate-glow mb-2">
          CODE<span className="text-white">HEIST</span>
        </h1>
        <p className="text-hacker-light text-lg md:text-xl">
          Terminal Hacking Challenge
        </p>
        <div className="mt-4 flex justify-center space-x-4 text-sm text-hacker-green/70">
          <span>■ CONNECTED</span>
          <span>■ ENCRYPTED</span>
          <span>■ ACTIVE</span>
        </div>
      </div>
    </header>
  )
}

export default Header
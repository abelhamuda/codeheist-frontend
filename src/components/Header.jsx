import React from 'react'

const Header = () => {
  return (
    <header className="py-8 md:py-12 relative z-40"> {/* Reduced padding and added z-index */}
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#BF1A1A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-40 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="text-center space-y-6 relative z-10">
        <div className="inline-block">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              CODE
            </span>
            <span className="bg-gradient-to-r from-[#BF1A1A] to-[#ff4444] bg-clip-text text-transparent">
              HEIST
            </span>
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#BF1A1A] to-transparent mt-2 rounded-full"></div>
        </div>
        
        <p className="text-lg md:text-xl text-white/60 font-light tracking-wide">
          Terminal Hacking Challenge
        </p>
        
        <div className="flex justify-center items-center space-x-6 pt-4">
          <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
            <span className="text-xs font-mono text-white/70">CONNECTED</span>
          </div>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
            <span className="text-xs font-mono text-white/70">ENCRYPTED</span>
          </div>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[#BF1A1A] shadow-lg shadow-red-500/50 animate-pulse"></div>
            <span className="text-xs font-mono text-white/70">ACTIVE</span>
          </div>
        </div>

        {/* Terminal hint text */}
        <div className="pt-6">
          <p className="text-sm text-white/40 font-mono animate-pulse">
            ↓ Drag the terminal to reposition ↓
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header
import React from 'react'

const Header = () => {
  return (
    <header className="pt-16 pb-8 md:pt-24 md:pb-12 relative z-40">

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#BF1A1A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-40 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center space-y-6 relative z-10">
        <div className="inline-block">
          {/* Replace header text with logo */}
          <img
            src="/codeheist.png"
            alt="CodeHeist Logo"
            className="mx-auto mt-8 w-[260px] md:w-[420px] object-contain"
          />

          {/* Gradient underline */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#BF1A1A] to-transparent mt-2 rounded-full"></div>
        </div>

        <p className="justify-center items-center text-lg md:text-xl text-white/60 font-light tracking-wide">
          Terminal Hacking Challenge
        </p>

        {/* Status indicators */}
        <div className="flex justify-center items-center space-x-4 pt-4">
          {/* CONNECTED */}
          <div className="flex items-center space-x-1">
            <img src="/dot-blue.png" alt="connected dot" className="w-2 h-2" />
            <span className="text-[10px] font-medium text-gray-400 tracking-wider">
              CONNECTED
            </span>
          </div>


          {/* ENCRYPTED */}
          <div className="flex items-center space-x-1">
            <img src="/dot-red.png" alt="encrypted dot" className="w-2 h-2" />
            <span className="text-[10px] font-medium text-gray-400 tracking-wider">
              ENCRYPTED
            </span>
          </div>


          {/* ACTIVE */}
          <div className="flex items-center space-x-1">
            <img src="/dot.png" alt="active dot" className="w-2 h-2" />
            <span className="text-[10px] font-medium text-gray-500 tracking-wider">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Terminal hint text */}
        <div className="pt-6">
          <p className="text-sm text-white/40 font-mono animate-pulse"></p>
        </div>
      </div>
    </header>
  )
}

export default Header

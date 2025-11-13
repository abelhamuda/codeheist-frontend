import React from 'react'
import Terminal from './components/Terminal'
import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#BF1A1A]/5"></div>
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#BF1A1A]/10 rounded-full blur-3xl animate-pulse" style={{animation: 'pulse 4s ease-in-out infinite'}}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animation: 'pulse 4s ease-in-out infinite', animationDelay: '2s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <Header />
        <Terminal />
        
        {/* Footer */}
        <footer className="py-8 mt-16 text-center">
          <p className="text-xs font-mono text-white/30">
            © 2024 CODEHEIST • All systems operational
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
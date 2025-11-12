import React from 'react'
import Terminal from './components/Terminal'
import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen bg-hacker-dark matrix-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 scan-line pointer-events-none"></div>
      
      {/* Glowing dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-hacker-green rounded-full animate-glow"></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-hacker-light rounded-full animate-glow" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <Header />
        <Terminal />
      </div>
    </div>
  )
}

export default App
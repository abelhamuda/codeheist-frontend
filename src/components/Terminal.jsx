import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

const CodeHeistTerminal = () => {
  const terminalRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const socketRef = useRef(null)
  const currentCommandRef = useRef('')
  const isProcessingRef = useRef(false)
  const terminalInstanceRef = useRef(null)
  const fitAddonRef = useRef(null)
  const isMountedRef = useRef(true)
  const reconnectTimeoutRef = useRef(null)
  const resizeHandlerRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true
    
    const initTimeout = setTimeout(() => {
      if (!isMountedRef.current || !terminalRef.current) return
      
      console.log('🚀 Initializing terminal...')
      
      const { term, fitAddon } = initializeTerminal()
      if (!term || !fitAddon) {
        console.error('Failed to initialize terminal')
        return
      }
      
      terminalInstanceRef.current = term
      fitAddonRef.current = fitAddon

      setTimeout(() => {
        if (isMountedRef.current) {
          connectWebSocket(term)
        }
      }, 100)
    }, 100)

    return () => {
      console.log('🧹 Cleaning up terminal and WebSocket')
      isMountedRef.current = false
      
      clearTimeout(initTimeout)
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current)
        resizeHandlerRef.current = null
      }
      
      if (terminalInstanceRef.current) {
        try {
          terminalInstanceRef.current.dispose()
        } catch (e) {
          console.error('Error disposing terminal:', e)
        }
        terminalInstanceRef.current = null
      }
      
      fitAddonRef.current = null
    }
  }, [])

  const initializeTerminal = () => {
    if (!terminalRef.current) {
      console.error('Terminal ref not ready')
      return { term: null, fitAddon: null }
    }

    try {
      const term = new Terminal({
        theme: {
          background: '#000000',
          foreground: '#ffffff',
          cursor: '#BF1A1A',
          selection: 'rgba(191, 26, 26, 0.3)',
          black: '#000000',
          red: '#BF1A1A',
          green: '#10b981',
          yellow: '#fbbf24',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#ffffff',
          brightBlack: '#666666',
          brightRed: '#ff4444',
          brightGreen: '#34d399',
          brightYellow: '#fde047',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#ffffff'
        },
        fontSize: 13,
        fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
        cursorBlink: true,
        allowTransparency: true,
        scrollback: 1000,
        convertEol: true,
        disableStdin: false,
        cursorStyle: 'block',
        rows: 24,
        cols: 80
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)
      
      term.open(terminalRef.current)
      
      setTimeout(() => {
        if (isMountedRef.current && fitAddon) {
          try {
            fitAddon.fit()
          } catch (e) {
            console.error('Error fitting terminal:', e)
          }
        }
      }, 200)

      resizeHandlerRef.current = () => {
        if (isMountedRef.current && fitAddon && terminalInstanceRef.current) {
          try {
            fitAddon.fit()
          } catch (e) {
            // Ignore resize errors
          }
        }
      }
      
      window.addEventListener('resize', resizeHandlerRef.current)

      return { term, fitAddon }
    } catch (e) {
      console.error('Error initializing terminal:', e)
      return { term: null, fitAddon: null }
    }
  }

  const connectWebSocket = (term) => {
    if (!isMountedRef.current) return
    
    console.log('🔄 Connecting to WebSocket...')
    
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    const wsUrl = 'wss://api-codeheist.abelhamuda.my.id/ws'
    
    try {
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close()
          return
        }
        
        console.log('✅ WebSocket connected to production API')
        setIsConnected(true)
        
        setupTerminalInput(term, ws)
      }

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return
        
        try {
          const data = JSON.parse(event.data)
          console.log('📨 Received from server:', data)
          handleServerMessage(data, term)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          if (term && !term._disposed) {
            term.write('\r\n\x1b[31mError parsing server message\x1b[0m\r\n')
          }
        }
      }

      ws.onclose = (event) => {
        if (!isMountedRef.current) return
        
        console.log('🔌 WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        
        if (term && !term._disposed && terminalInstanceRef.current) {
          term.write('\r\n\x1b[31m● DISCONNECTED FROM SERVER\x1b[0m\r\n')
          term.write('\x1b[33mReconnecting in 3 seconds...\x1b[0m\r\n')
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && terminalInstanceRef.current) {
              connectWebSocket(term)
            }
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        if (!isMountedRef.current) return
        
        console.error('WebSocket error:', error)
        if (term && !term._disposed) {
          term.write('\r\n\x1b[31m● WEBSOCKET CONNECTION ERROR\x1b[0m\r\n')
        }
      }
    } catch (e) {
      console.error('Failed to create WebSocket:', e)
      if (isMountedRef.current && term && !term._disposed) {
        term.write('\r\n\x1b[31m● FAILED TO CONNECT TO SERVER\x1b[0m\r\n')
      }
    }
  }

  const setupTerminalInput = (term, ws) => {
    if (!isMountedRef.current) return
    
    console.log('⌨️ Setting up terminal input handling')
    currentCommandRef.current = ''
    isProcessingRef.current = false

    term.onData((data) => {
      if (!isMountedRef.current) return
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return
      }

      if (isProcessingRef.current) {
        return
      }

      if (data === '\r' || data === '\n') {
        if (currentCommandRef.current.trim()) {
          isProcessingRef.current = true
          term.write('\r\n')
          
          const commandToSend = currentCommandRef.current
          console.log('📤 Sending command:', commandToSend)
          
          try {
            ws.send(JSON.stringify({
              type: 'command',
              command: commandToSend
            }))
          } catch (e) {
            console.error('Error sending command:', e)
            isProcessingRef.current = false
            term.write('\r\n\x1b[31mError sending command\x1b[0m\r\n$ ')
          }
          
          currentCommandRef.current = ''
        } else {
          term.write('\r\n$ ')
        }
      }
      else if (data === '\x7f' || data === '\b') {
        if (currentCommandRef.current.length > 0) {
          currentCommandRef.current = currentCommandRef.current.slice(0, -1)
          term.write('\b \b')
        }
      }
      else if (data === '\x03') {
        term.write('^C\r\n$ ')
        currentCommandRef.current = ''
        isProcessingRef.current = false
      }
      else if (data === '\x0c') {
        term.clear()
        term.write('$ ' + currentCommandRef.current)
      }
      else if (data.charCodeAt(0) === 27) {
        // Ignore escape sequences
      }
      else if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
        currentCommandRef.current += data
        term.write(data)
      }
    })

    setTimeout(() => {
      if (isMountedRef.current && term && !term._disposed) {
        term.focus()
      }
    }, 100)
  }

  const handleServerMessage = (data, term) => {
    if (!isMountedRef.current || !term || term._disposed) return
    
    try {
      switch (data.type) {
        case 'output':
          term.write(data.content)
          break
          
        case 'prompt':
          term.write(data.content)
          isProcessingRef.current = false
          break
          
        case 'level_up':
          term.write(`\r\n\x1b[32m🎉 LEVEL ${data.level} COMPLETED!\x1b[0m\r\n`)
          term.write('\x1b[33mAccess granted to next level...\x1b[0m\r\n')
          break
          
        case 'session_created':
          setSessionId(data.session_id)
          if (data.content) {
            term.write(data.content)
          }
          break
          
        default:
          if (data.content) {
            term.write(data.content)
          }
      }

      setTimeout(() => {
        if (isMountedRef.current && term && !term._disposed) {
          term.focus()
        }
      }, 50)
    } catch (e) {
      console.error('Error handling server message:', e)
    }
  }

  const handleTerminalClick = () => {
    if (isMountedRef.current && terminalInstanceRef.current) {
      terminalInstanceRef.current.focus()
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="flex justify-center w-full">
        {/* Floating macOS Terminal */}
        <div className="terminal-float justify-center transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 w-1/2">
          {/* macOS Traffic Lights */}
          <div className="terminal-header bg-gradient-to-b from-gray-900 to-gray-800 border-b border-gray-700 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
                </div>
                <div className="h-4 w-px bg-gray-600 mx-2"></div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'} transition-colors duration-300`}></div>
                  <span className="text-xs pl-12 font-medium text-gray-300">
                    {isConnected ? 'CONNECTED' : 'CONNECTING...'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="bg-black/40 rounded-xl px-4 py-2 inline-block border border-gray-700/50 backdrop-blur-sm">
                  <span className="text-sm font-semibold text-gray-200 tracking-wide">
                    codeheist@terminal ~
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 opacity-60">
                <div className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded border border-gray-700/30">
                  v2.0
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef} 
            className="w-full h-[300px] bg-gradient-to-br from-black via-gray-900 to-black cursor-text border-x border-gray-700/50"
            onClick={handleTerminalClick}
            style={{ 
              minHeight: '400px',
              overflow: 'hidden'
            }}
          />

          {/* Status Bar */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-t border-gray-700 rounded-b-2xl px-6 py-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4 font-mono">
                <span className="text-gray-400">SESSION:</span>
                <span className="text-red-300 font-semibold bg-black/30 px-2 py-1 rounded border border-gray-700/30">
                  {sessionId ? sessionId.substring(0, 8) : '••••••••'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                <span className="text-gray-400 font-mono bg-black/30 px-2 py-1 rounded border border-gray-700/30">
                  SECURE TERMINAL
                </span>
              </div>
            </div>
          </div>

          {/* Floating Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 blur-xl -z-10 opacity-60 pointer-events-none"></div>
        </div>
      </div>
      
      <style jsx>{`
        .terminal-float {
          border-radius: 20px;
          background: linear-gradient(145deg, 
            rgba(25, 25, 25, 0.95) 0%,
            rgba(15, 15, 15, 0.98) 50%,
            rgba(25, 25, 25, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 25px 60px -20px rgba(0, 0, 0, 0.8),
            0 20px 40px -20px rgba(191, 26, 26, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.8);
          position: relative;
          overflow: hidden;
          animation: float 6s ease-in-out infinite;
        }

        .terminal-float::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.1),
              0 25px 60px -20px rgba(0, 0, 0, 0.8),
              0 20px 40px -20px rgba(191, 26, 26, 0.4);
          }
          50% {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.15),
              0 35px 80px -25px rgba(0, 0, 0, 0.9),
              0 30px 60px -25px rgba(191, 26, 26, 0.5);
          }
        }

        .terminal-header {
          user-select: none;
          -webkit-user-select: none;
          background: linear-gradient(135deg, 
            rgba(40, 40, 40, 0.95) 0%,
            rgba(30, 30, 30, 0.98) 100%) !important;
        }

        /* Custom scrollbar for terminal */
        :global(.xterm-viewport) {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        :global(.xterm-viewport::-webkit-scrollbar) {
          width: 8px;
        }

        :global(.xterm-viewport::-webkit-scrollbar-track) {
          background: transparent;
        }

        :global(.xterm-viewport::-webkit-scrollbar-thumb) {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        :global(.xterm-viewport::-webkit-scrollbar-thumb:hover) {
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  )
}

export default CodeHeistTerminal
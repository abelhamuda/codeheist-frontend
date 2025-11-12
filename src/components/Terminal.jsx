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
    
    // Delay initialization to avoid React Strict Mode double mount issues
    const initTimeout = setTimeout(() => {
      if (!isMountedRef.current || !terminalRef.current) return
      
      console.log('🚀 Initializing terminal...')
      
      // Initialize terminal first
      const { term, fitAddon } = initializeTerminal()
      if (!term || !fitAddon) {
        console.error('Failed to initialize terminal')
        return
      }
      
      terminalInstanceRef.current = term
      fitAddonRef.current = fitAddon

      // Then connect to WebSocket after a short delay
      setTimeout(() => {
        if (isMountedRef.current) {
          connectWebSocket(term)
        }
      }, 100)
    }, 100)

    // Cleanup function
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
      
      // Dispose terminal last
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
          background: '#0a0a0a',
          foreground: '#00ff00',
          cursor: '#00ff00',
          selection: 'rgba(0, 255, 0, 0.3)',
          black: '#000000',
          red: '#ff0000',
          green: '#00ff00',
          yellow: '#ffff00',
          blue: '#0000ff',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          white: '#ffffff',
          brightBlack: '#666666',
          brightRed: '#ff6666',
          brightGreen: '#66ff66',
          brightYellow: '#ffff66',
          brightBlue: '#6666ff',
          brightMagenta: '#ff66ff',
          brightCyan: '#66ffff',
          brightWhite: '#ffffff'
        },
        fontSize: 14,
        fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
        cursorBlink: true,
        allowTransparency: false,
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
      
      // Fit after opening with a delay
      setTimeout(() => {
        if (isMountedRef.current && fitAddon) {
          try {
            fitAddon.fit()
          } catch (e) {
            console.error('Error fitting terminal:', e)
          }
        }
      }, 200)

      // Handle window resize
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
    
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    const wsUrl = 'ws://localhost:8080/ws'
    
    try {
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close()
          return
        }
        
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        
        // Setup terminal input handling after connection
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
        
        // Only show message and reconnect if terminal still exists
        if (term && !term._disposed && terminalInstanceRef.current) {
          term.write('\r\n\x1b[31m● DISCONNECTED FROM SERVER\x1b[0m\r\n')
          term.write('\x1b[33mReconnecting in 3 seconds...\x1b[0m\r\n')
          
          // Clear any existing reconnect timeout
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
        term.write('\r\n\x1b[31m● FAILED TO CONNECT\x1b[0m\r\n')
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

      // Enter key (submit command)
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
      // Backspace or Delete key
      else if (data === '\x7f' || data === '\b') {
        if (currentCommandRef.current.length > 0) {
          currentCommandRef.current = currentCommandRef.current.slice(0, -1)
          term.write('\b \b')
        }
      }
      // Ctrl+C - interrupt current command
      else if (data === '\x03') {
        term.write('^C\r\n$ ')
        currentCommandRef.current = ''
        isProcessingRef.current = false
      }
      // Ctrl+L - clear screen
      else if (data === '\x0c') {
        term.clear()
        term.write('$ ' + currentCommandRef.current)
      }
      // Arrow keys and other escape sequences - ignore for now
      else if (data.charCodeAt(0) === 27) {
        // Ignore escape sequences
      }
      // Printable characters (normal input)
      else if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
        currentCommandRef.current += data
        term.write(data)
      }
    })

    // Enable terminal focus
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

      // Ensure terminal stays focused
      setTimeout(() => {
        if (isMountedRef.current && term && !term._disposed) {
          term.focus()
        }
      }, 50)
    } catch (e) {
      console.error('Error handling server message:', e)
    }
  }

  // Handle container click to focus terminal
  const handleTerminalClick = () => {
    if (isMountedRef.current && terminalInstanceRef.current) {
      terminalInstanceRef.current.focus()
    }
  }

  return (
    <div className="mt-8 terminal-glow rounded-lg border border-hacker-green/50 bg-hacker-darker/80 backdrop-blur-sm">
      <div className="flex items-center px-4 py-2 border-b border-hacker-green/30">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-sm text-hacker-green">
          {isConnected ? '● CONNECTED' : '● CONNECTING...'} | CODEHEIST TERMINAL
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="w-full h-96 md:h-[500px] p-4 cursor-text"
        onClick={handleTerminalClick}
        style={{ 
          minHeight: '400px',
          overflow: 'hidden'
        }}
      />
      <div className="px-4 py-2 border-t border-hacker-green/30 text-xs text-hacker-green/70 flex justify-between">
        <span>SESSION: {sessionId || 'ESTABLISHING...'}</span>
        <span>MODE: SECURE TERMINAL</span>
      </div>
    </div>
  )
}

export default CodeHeistTerminal
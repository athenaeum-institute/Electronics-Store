import { useState, useRef, useEffect } from 'react'
import { Mic, Phone, PhoneOff } from 'lucide-react'

const WS_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:8000/ws/voice'
  : 'wss://electronics-store-production-597b.up.railway.app/ws/voice'

type AgentState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking'

export default function AIVoiceAgent() {
  const [state, setState] = useState<AgentState>('idle')
  const [error, setError] = useState<string>('')
  const [transcript, setTranscript] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isReadyRef = useRef<boolean>(false)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    return () => { cleanup() }
  }, [])

  const cleanup = () => {
    isReadyRef.current = false
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    wsRef.current = null
    mediaRecorderRef.current = null
    streamRef.current = null
  }

  const startCall = async () => {
    try {
      setError('')
      setTranscript('')
      setState('connecting')

      // Step 1: Get mic FIRST before WebSocket
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      })
      streamRef.current = stream

      // Step 2: Connect WebSocket
      const ws = new WebSocket(WS_URL)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = async (event) => {
        // Audio response from server
        if (event.data instanceof ArrayBuffer) {
          setState('speaking')
          const blob = new Blob([event.data], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audio.onended = () => {
            URL.revokeObjectURL(url)
            if (isReadyRef.current) {
              setState('listening')
            }
          }
          await audio.play().catch(console.error)
          return
        }

        // JSON messages
        try {
          const msg = JSON.parse(event.data as string)
          console.log('📨 Server message:', msg.type, msg.text || '')

          if (msg.type === 'ready') {
            console.log('🎤 Server ready — starting mic stream')
            isReadyRef.current = true
            setState('listening')
            startMicStream(ws, stream)
          }

          if (msg.type === 'transcript') {
            setTranscript(msg.text)
            if (msg.text.trim()) setState('processing')
          }

          if (msg.type === 'ai_response') {
            setTranscript(msg.text)
          }

          if (msg.type === 'error') {
            console.error('Server error:', msg.text)
          }
        } catch (_) {}
      }

      ws.onerror = (e) => {
        console.error('WebSocket error:', e)
        setError('Connection failed. Please try WhatsApp.')
        setState('idle')
        cleanup()
      }

      ws.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason)
        isReadyRef.current = false
        setState('idle')
      }

    } catch (err: any) {
      console.error('startCall error:', err)
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow mic.')
      } else {
        setError('Could not start call. Please try WhatsApp.')
      }
      setState('idle')
    }
  }

  const startMicStream = (ws: WebSocket, stream: MediaStream) => {
    console.log('🎙️ Starting MediaRecorder stream...')
    
    // Find supported mimeType
    const mimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ].find(t => MediaRecorder.isTypeSupported(t)) || ''

    console.log('Using mimeType:', mimeType || 'browser default')

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('📤 Sending audio chunk:', event.data.size, 'bytes')
          ws.send(event.data)
        } else {
          console.warn('WebSocket not open, skipping chunk')
        }
      }
    }

    recorder.onerror = (e) => {
      console.error('MediaRecorder error:', e)
    }

    recorder.onstart = () => {
      console.log('✅ MediaRecorder started')
    }

    // Send chunk every 100ms for real-time streaming
    recorder.start(100)
  }

  const endCall = () => {
    cleanup()
    setState('idle')
    setError('')
    setTranscript('')
  }

  const getButtonStyle = () => {
    switch (state) {
      case 'idle': return 'bg-black text-white hover:bg-gray-800'
      case 'connecting': return 'bg-yellow-500 text-white'
      case 'listening': return 'bg-red-500 text-white animate-pulse'
      case 'processing': return 'bg-blue-500 text-white'
      case 'speaking': return 'bg-green-500 text-white'
    }
  }

  const getButtonText = () => {
    switch (state) {
      case 'idle': return 'Need Help? Call Now'
      case 'connecting': return 'Connecting...'
      case 'listening': return 'Listening...'
      case 'processing': return 'Processing...'
      case 'speaking': return 'Speaking...'
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2 max-w-xs">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl shadow text-right">
          {error}
        </div>
      )}

      {transcript && state !== 'idle' && (
        <div className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-xl shadow max-w-48 text-right leading-relaxed">
          {transcript}
        </div>
      )}

      {state === 'idle' ? (
        <button
          onClick={startCall}
          className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm transition-all duration-300 bg-black text-white hover:bg-gray-800"
        >
          <Phone size={16} />
          Need Help? Call Now
        </button>
      ) : (
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm ${getButtonStyle()}`}>
            <Mic size={16} />
            {getButtonText()}
          </div>
          <button
            onClick={endCall}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors shadow"
          >
            <PhoneOff size={13} />
            End Call
          </button>
        </div>
      )}
    </div>
  )
}

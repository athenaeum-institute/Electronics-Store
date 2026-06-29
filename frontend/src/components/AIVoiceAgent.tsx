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

  useEffect(() => {
    return () => { cleanup() }
  }, [])

  const cleanup = () => {
    const ac = (streamRef.current as any)?._audioContext
    const proc = (streamRef.current as any)?._processor  
    const src = (streamRef.current as any)?._source
    if (src) src.disconnect()
    if (proc) proc.disconnect()
    if (ac) ac.close()

    isReadyRef.current = false
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

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      streamRef.current = stream

      const ws = new WebSocket(WS_URL)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setState('connecting')
      }

      ws.onmessage = async (event) => {
        // Binary = audio to play
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
          audio.play().catch(console.error)
          return
        }

        // JSON messages
        try {
          const msg = JSON.parse(event.data)
          
          if (msg.type === 'ready') {
            // Server is ready — NOW start sending mic audio
            isReadyRef.current = true
            setState('listening')
            startStreamingMic(ws, stream)
          }
          
          if (msg.type === 'transcript') {
            setTranscript(msg.text)
            setState('processing')
          }
          
          if (msg.type === 'ai_response') {
            setTranscript(msg.text)
          }
          
          if (msg.type === 'error') {
            console.error('Server error:', msg.text)
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }

      ws.onerror = (e) => {
        console.error('WebSocket error:', e)
        setError('Connection failed. Please try WhatsApp.')
        setState('idle')
        cleanup()
      }

      ws.onclose = () => {
        console.log('WebSocket closed')
        isReadyRef.current = false
        setState('idle')
      }

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow mic.')
      } else {
        setError('Could not start call. Please try WhatsApp.')
      }
      setState('idle')
    }
  }

  const startStreamingMic = (ws: WebSocket, stream: MediaStream) => {
    // Use AudioContext to get raw PCM audio — more reliable than MediaRecorder
    const audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(stream)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return
      
      const inputData = e.inputBuffer.getChannelData(0)
      // Convert Float32 to Int16 PCM
      const pcmData = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]))
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      ws.send(pcmData.buffer)
    }
    
    // Store reference to stop later
    ;(streamRef.current as any)._audioContext = audioContext
    ;(streamRef.current as any)._processor = processor
    ;(streamRef.current as any)._source = source
    
    console.log('PCM mic streaming started')
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
        <div className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-xl shadow max-w-48 text-right">
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

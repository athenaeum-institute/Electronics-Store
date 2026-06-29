import { MapPin, Phone, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import AIVoiceAgent from '../components/AIVoiceAgent';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  // AI Voice Call state
  const [callStatus, setCallStatus] = useState<'idle'|'connecting'|'active'|'ended'>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const wsRef = useRef<WebSocket|null>(null);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const audioContextRef = useRef<AudioContext|null>(null);
  const pingIntervalRef = useRef<any>(null);

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      const ws = new WebSocket(`${WS_URL}/ws/voice`);
      wsRef.current = ws;
      audioContextRef.current = new AudioContext();

      ws.onopen = () => {
        setCallStatus('active');
        // DO NOT start MediaRecorder here — wait for backend 'ready' signal
        // so that Deepgram is fully started before we send audio
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          const msg = JSON.parse(event.data);

          // Backend signals that Deepgram is ready to receive audio
          if (msg.type === 'ready') {
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (e) => {
              if (ws.readyState === WebSocket.OPEN && e.data.size > 0) {
                ws.send(e.data);
              }
            };
            mediaRecorder.start(250); // smaller chunks = faster recognition

            pingIntervalRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send('ping');
              }
            }, 5000);
          }

          if (msg.type === 'transcript') setTranscript(msg.text);
          if (msg.type === 'ai_response') setAiResponse(msg.text);
          if (msg.type === 'error') {
            console.error('Backend error:', msg.text);
            // Optionally show to user in UI if needed, for now just console
          }
        } else {
          // Play audio response
          const arrayBuffer = await event.data.arrayBuffer();
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          const source = audioContextRef.current!.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current!.destination);
          source.start();
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setCallStatus('idle');
      };

      // DO NOT auto-reconnect — this causes an infinite loop where
      // Deepgram never gets to listen because the connection keeps resetting
      ws.onclose = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        mediaRecorderRef.current?.stop();
        stream.getTracks().forEach(t => t.stop());
        setCallStatus(prev => prev === 'active' ? 'ended' : prev);
        setTimeout(() => setCallStatus(s => s === 'ended' ? 'idle' : s), 3000);
      };

    } catch (err) {
      setCallStatus('idle');
      console.error('Call failed:', err);
    }
  };

  const endCall = () => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    mediaRecorderRef.current?.stop();
    wsRef.current?.close();
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setTranscript('');
      setAiResponse('');
    }, 3000);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Ali Electronics! My name is ${formData.name}, my phone is ${formData.phone}. Message: ${formData.message}`;
    const url = `https://wa.me/923286715408?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="bg-surface-container-lowest min-h-screen pt-20 md:pt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-container-margin pt-6 pb-16">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-neutral-900 font-semibold">Contact Us</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-neutral-900 leading-tight">
            Get in Touch
          </h1>
          <p className="text-neutral-500 mt-2 text-sm md:text-base max-w-lg leading-relaxed">
            Have a question or need assistance? Visit our official Haier store or contact us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Info & Form */}
          <div className="flex flex-col gap-8">

            {/* AI Voice Call Button */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Need Help?</h3>
                  <p className="text-sm text-white/70 mt-1">Talk to our AI assistant instantly</p>
                </div>
                {callStatus === 'idle' && (
                  <button
                    onClick={startCall}
                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
                  >
                    📞 Call Now
                  </button>
                )}
                {callStatus === 'connecting' && (
                  <span className="text-sm text-white/70 animate-pulse">Connecting...</span>
                )}
                {callStatus === 'active' && (
                  <button
                    onClick={endCall}
                    className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-600 transition-colors animate-pulse"
                  >
                    📵 End Call
                  </button>
                )}
              </div>

              {callStatus === 'active' && (
                <div className="mt-4 space-y-2">
                  {transcript && (
                    <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                      <span className="text-white/50 text-xs">You: </span>{transcript}
                    </div>
                  )}
                  {aiResponse && (
                    <div className="bg-white/20 rounded-xl px-4 py-2 text-sm">
                      <span className="text-white/50 text-xs">Haier Assistant: </span>{aiResponse}
                    </div>
                  )}
                </div>
              )}

              {callStatus === 'ended' && (
                <p className="text-sm text-white/70 mt-3">Call ended. Thank you for contacting Ali Electronics!</p>
              )}
            </div>

            {/* Store Info Card */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[24px] bento-card-shadow">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Store Information</h3>
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">Address</h4>
                    <p className="text-neutral-600 text-sm">493 Lahore Rd, Saddar Cantt, Lahore, 54000, Pakistan</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">Phone</h4>
                    <p className="text-neutral-600 text-sm">+92 328 6715408</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">WhatsApp</h4>
                    <a
                      href="https://wa.me/923286715408"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-1 items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#20BA5A] transition-colors w-fit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.882l6.18-1.621A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.716.976.992-3.624-.234-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">Business Hours</h4>
                    <p className="text-neutral-600 text-sm">Monday – Sunday: 9:00 AM – 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[24px] bento-card-shadow">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Send an Inquiry</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-low border border-surface-container-highest rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400 font-medium text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-low border border-surface-container-highest rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400 font-medium text-sm"
                    placeholder="0300 1234567"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-low border border-surface-container-highest rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400 font-medium text-sm resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] mt-2 text-white"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Submit via WhatsApp
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Map */}
          <div className="h-64 lg:h-full rounded-[24px] overflow-hidden bento-card-shadow">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.6!2d74.3294!3d31.5558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s493+Lahore+Rd%2C+Saddar+Cantt%2C+Lahore%2C+54000%2C+Pakistan!5e0!3m2!1sen!2spk!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '12px', minHeight: '500px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
        <AIVoiceAgent />
      </div>
    </main>
  );
}

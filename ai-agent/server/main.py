from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import edge_tts
import tempfile
import os, asyncio, sys
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are Haier Assistant, a warm and knowledgeable female AI voice agent for Ali Electronics — an official Haier store at 493 Lahore Rd, Saddar Cantt, Lahore, Pakistan.
Keep responses SHORT — max 2-3 sentences (this is a voice call).
If customer speaks Urdu/Roman Urdu → respond in Roman Urdu.
If customer speaks English → respond in English.
Store WhatsApp: +92 328 6715408. Hours: 9AM-9PM daily."""

def detect_voice(text: str) -> str:
    urdu_chars = set('ابتثجحخدذرزسشصضطظعغفقکگلمنوہیے')
    if any(char in urdu_chars for char in text):
        return "ur-PK-UzmaNeural"
    return "en-US-JennyNeural"

async def text_to_speech(text: str) -> bytes:
    voice = detect_voice(text)
    communicate = edge_tts.Communicate(text=text, voice=voice)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp_path = tmp.name
    await communicate.save(tmp_path)
    with open(tmp_path, "rb") as f:
        audio_bytes = f.read()
    os.unlink(tmp_path)
    return audio_bytes

async def transcribe_audio(audio_bytes: bytes) -> str:
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp_path = tmp.name
        
        # Convert webm to wav using ffmpeg
        proc = await asyncio.create_subprocess_exec(
            'ffmpeg', '-i', 'pipe:0', '-ar', '16000', '-ac', '1', 
            '-f', 'wav', tmp_path, '-y', '-loglevel', 'quiet',
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate(input=audio_bytes)
        
        with open(tmp_path, "rb") as f:
            result = await asyncio.to_thread(
                groq_client.audio.transcriptions.create,
                model="whisper-large-v3-turbo",
                file=("audio.wav", f, "audio/wav"),
                language=None,
            )
        os.unlink(tmp_path)
        text = result.text.strip()
        
        # Ignore hallucinations — common Whisper false positives
        hallucinations = [
            'thank you', 'thanks', 'you', '.', '..', '...', 
            'the', 'a', 'i', 'oh', 'um', 'uh'
        ]
        if text.lower() in hallucinations:
            print(f"Ignoring hallucination: '{text}'")
            return ""
            
        print(f"Transcribed: '{text}'")
        return text
        
    except Exception as e:
        print(f"Transcription error: {e}")
        try:
            os.unlink(tmp_path)
        except:
            pass
        return ""

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    conversation_history = [{"role": "system", "content": SYSTEM_PROMPT}]
    audio_buffer = bytearray()

    try:
        # Send greeting
        greeting_response = await asyncio.to_thread(
            groq_client.chat.completions.create,
            model="llama-3.1-8b-instant",
            messages=conversation_history + [{"role": "user", "content": "greet the customer briefly in 1 sentence"}],
            max_tokens=60,
        )
        greeting_text = greeting_response.choices[0].message.content
        greeting_audio = await text_to_speech(greeting_text)
        
        await websocket.send_json({"type": "ai_response", "text": greeting_text})
        await websocket.send_bytes(greeting_audio)
        await websocket.send_json({"type": "ready"})

        # Main loop — collect audio chunks, transcribe every 4 seconds
        last_process_time = asyncio.get_event_loop().time()

        while True:
            try:
                message = await asyncio.wait_for(
                    websocket.receive(),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
                continue

            if message["type"] == "websocket.disconnect":
                break

            if message["type"] == "websocket.receive":
                if "text" in message and message["text"] == "ping":
                    continue
                    
                if "bytes" in message and message["bytes"]:
                    audio_buffer.extend(message["bytes"])
                    print(f"Buffer size: {len(audio_buffer)} bytes")
                    
                    current_time = asyncio.get_event_loop().time()
                    
                    # Process every 4 seconds or when buffer > 64KB
                    if (current_time - last_process_time >= 3.0 or 
                        len(audio_buffer) > 65536):
                        
                        if len(audio_buffer) > 5000:
                            chunk = bytes(audio_buffer)
                            audio_buffer.clear()
                            last_process_time = current_time
                            
                            # Transcribe
                            text = await transcribe_audio(chunk)
                            print(f"Transcribed: '{text}'")
                            
                            if text:
                                await websocket.send_json({"type": "transcript", "text": text})
                                
                                # Get AI response
                                conversation_history.append({"role": "user", "content": text})
                                chat_response = await asyncio.to_thread(
                                    groq_client.chat.completions.create,
                                    model="llama-3.1-8b-instant",
                                    messages=conversation_history,
                                    max_tokens=150,
                                    temperature=0.7,
                                )
                                ai_text = chat_response.choices[0].message.content
                                conversation_history.append({"role": "assistant", "content": ai_text})
                                
                                await websocket.send_json({"type": "ai_response", "text": ai_text})
                                
                                # TTS
                                response_audio = await text_to_speech(ai_text)
                                await websocket.send_bytes(response_audio)
                        else:
                            audio_buffer.clear()
                            last_process_time = current_time

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Session error: {e}")
        import traceback
        traceback.print_exc()

@app.get("/health")
def health():
    return {"status": "ok", "agent": "Haier Assistant"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

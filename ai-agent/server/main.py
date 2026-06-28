from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from groq import Groq
import edge_tts
import tempfile
import os, json, asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)

def detect_language(text: str) -> str:
    urdu_chars = set('ابتثجحخدذرزسشصضطظعغفقکگلمنوہیے')
    if any(char in urdu_chars for char in text):
        return "ur-PK-UzmaNeural"
    return "en-US-JennyNeural"

SYSTEM_PROMPT = """You are Haier Assistant, a helpful female AI voice agent for Ali Electronics — an official Haier store located at 493 Lahore Rd, Saddar Cantt, Lahore, Pakistan.

Your job:
- Help customers with Haier product information (ACs, Refrigerators, Washing Machines, LED TVs, Freezers, Water Dispensers, Microwaves, Kitchen Appliances, Laptops)
- Answer questions about prices, warranty, features, specifications
- Help customers place inquiries
- Guide customers to the right product for their needs
- Provide store information (address, hours, WhatsApp: +92 328 6715408)

Store hours: Monday to Sunday, 9AM to 9PM
WhatsApp: +92 328 6715408
Address: 493 Lahore Rd, Saddar Cantt, Lahore, 54000

Language rules:
- If customer speaks in English, respond in English
- If customer speaks in Urdu or Roman Urdu, respond in Urdu/Roman Urdu naturally
- If mixed, match their style
- Always be warm, helpful, and professional

Keep responses SHORT and conversational — this is a voice call, not a chat. Max 2-3 sentences per response.

Always greet in English first: "Hello! I'm Haier Assistant from Ali Electronics. How can I help you today?"
Then detect customer language and respond accordingly. """

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    conversation_history = [{"role": "system", "content": SYSTEM_PROMPT}]

    deepgram = DeepgramClient(DEEPGRAM_API_KEY)
    dg_connection = deepgram.listen.websocket.v("1")
    transcript_buffer = ""

    def on_transcript(self, result, **kwargs):
        nonlocal transcript_buffer
        try:
            sentence = result.channel.alternatives[0].transcript
            if result.is_final and sentence.strip():
                transcript_buffer = sentence
                asyncio.run_coroutine_threadsafe(
                    process_transcript(sentence),
                    asyncio.get_event_loop()
                )
        except Exception as e:
            print(f"Transcript error: {e}")

    async def process_transcript(text: str):
        try:
            conversation_history.append({"role": "user", "content": text})
            await websocket.send_json({"type": "transcript", "text": text})

            chat_response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=conversation_history,
                max_tokens=150,
                temperature=0.7,
            )
            ai_text = chat_response.choices[0].message.content
            conversation_history.append({"role": "assistant", "content": ai_text})

            await websocket.send_json({"type": "ai_response", "text": ai_text})

            voice = detect_language(ai_text)
            communicate = edge_tts.Communicate(text=ai_text, voice=voice)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
                tmp_path = tmp.name
            await communicate.save(tmp_path)
            with open(tmp_path, "rb") as f:
                audio_bytes = f.read()
            os.unlink(tmp_path)
            await websocket.send_bytes(audio_bytes)

        except Exception as e:
            await websocket.send_json({"type": "ai_response", "text": f"Error: {str(e)}"})

    dg_connection.on(LiveTranscriptionEvents.Transcript, on_transcript)

    options = LiveOptions(
        model="nova-2",
        language="multi",
        smart_format=True,
        interim_results=False,
        punctuate=True,
    )

    dg_connection.start(options)

    try:
        greeting_response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=conversation_history + [{"role": "user", "content": "greet the customer"}],
            max_tokens=60,
        )
        greeting_text = greeting_response.choices[0].message.content
        await websocket.send_json({"type": "ai_response", "text": greeting_text})
        # Greeting always in English
        communicate = edge_tts.Communicate(
            text=greeting_text,
            voice="en-US-JennyNeural"
        )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp_path = tmp.name
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        os.unlink(tmp_path)
        await websocket.send_bytes(audio_bytes)

        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.receive":
                if "text" in message and message["text"] == "ping":
                    continue
                if "bytes" in message and message["bytes"]:
                    dg_connection.send(message["bytes"])

    except WebSocketDisconnect:
        print("Client disconnected.")
        dg_connection.finish()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Server error: {e}")
        try:
            await websocket.send_json({"type": "ai_response", "text": f"System Error: {str(e)}"})
            await asyncio.sleep(2) # Give the frontend time to receive it
        except:
            pass
        dg_connection.finish()
        await websocket.close()

@app.get("/health")
def health():
    return {"status": "ok", "agent": "Haier Assistant"}

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from groq import Groq
import edge_tts
import tempfile
import os, asyncio, sys

# Fix for macOS SSL Certificate errors (only apply on macOS, NOT on Railway/Linux)
if sys.platform == "darwin":
    import certifi
    os.environ["SSL_CERT_FILE"] = certifi.where()

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins so Vercel frontend can connect
    allow_credentials=True,
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

SYSTEM_PROMPT = """You are Haier Assistant, a warm and knowledgeable female AI voice agent for Ali Electronics — an official Haier store at 493 Lahore Rd, Saddar Cantt, Lahore, Pakistan.

PERSONALITY:
- Warm, friendly, professional
- Like a helpful sales expert who genuinely wants to help
- Never pushy, always honest
- Keep responses SHORT — max 2-3 sentences (this is a voice call)

LANGUAGE RULES:
- Greet always in English first
- If customer speaks Urdu/Roman Urdu → respond in Roman Urdu naturally
- If customer speaks English → respond in English
- If mixed → match their style
- Roman Urdu example: "Ji bilkul, Haier ka 1.5 ton AC aapke liye perfect rahega"

STORE INFO:
- Name: Ali Electronics — Haier Official Store
- Address: 493 Lahore Rd, Saddar Cantt, Lahore, 54000
- WhatsApp: +92 328 6715408
- Hours: Monday to Sunday, 9AM to 9PM
- We are OFFICIAL Haier store — genuine products, official warranty
- Free delivery in Lahore

PRODUCTS & PRICES (June 2026):

AIR CONDITIONERS:
1. Haier Super T3 Pro Inverter AC 1 Ton — Rs. 134,999 (original Rs. 145,000)
   Model: HSU-13HFS/013WDC(G)-T3 Pro
   Key features: 65°C T3 compressor, WiFi control, self-clean, UPS compatible, golden color
   Warranty: 10 Years Compressor + 5 Years All Parts FREE

2. Haier T3 Plus Inverter AC 1.5 Ton — Rs. 171,999 (original Rs. 185,000)
   Model: HSU-20HFTEX/023WDC(OW)-T3 Plus
   Key features: Heat & Cool, WiFi, self-clean, UPS compatible
   Colors: Diamond White, Dark Grey
   Warranty: 10 Years Compressor + 5 Years All Parts FREE

3. Haier UV T3 Plus Inverter AC 2 Ton — Rs. 237,000 (original Rs. 255,000)
   Model: HPU-24HDZUV/013WSDC(W)-T3
   Key features: UV sterilization kills 99% bacteria, T3 compressor, WiFi
   Warranty: 10 Years Compressor + 5 Years All Parts FREE

4. Haier Solar Hybrid T3 Plus AC 1.5 Ton — Rs. 299,000 (original Rs. 320,000)
   Model: SolarHybrid-III(OW)-T3
   Key features: Runs on solar panels, zero electricity cost in daytime, WiFi
   Warranty: 10 Years Compressor + 5 Years All Parts FREE

REFRIGERATORS:
1. Haier Twin Inverter IOT Refrigerator 18 Cu Ft — Rs. 179,999 (original Rs. 195,000)
   Model: HRF-538TIFGU1
   Colors: Glass Gold, Glass Black
   Features: WiFi/IOT app control, Turbo Icing, A.SPE sterilization, frost-free
   Warranty: 10 Years Compressor FREE

2. Haier T-Door Refrigerator 22 Cu Ft — Rs. 285,000 (original Rs. 310,000)
   Model: HRF-678TGG
   Colors: Glass Gold, Glass Black
   Features: Triple door, bottom freezer, frost-free, inverter
   Warranty: 10 Years Compressor FREE

3. Haier SBS Side By Side 22 Cu Ft — Rs. 320,000 (original Rs. 350,000)
   Model: HRF-622IBG
   Colors: Glass Gold, Glass Black, Glass Silver
   Features: Side by side, water dispenser, ice maker, frost-free
   Warranty: 10 Years Compressor FREE

4. Haier Inverter Refrigerator 14 Cu Ft — Rs. 114,999 (original Rs. 125,000)
   Model: HRF-418TIFGU1
   Colors: Glass Gold, Glass Black
   Features: Digital inverter, turbo icing, frost-free
   Warranty: 10 Years Compressor FREE

WASHING MACHINES:
1. Haier Front Load 10 Kg — Rs. 139,999 (original Rs. 155,000)
   Model: HW100-BP14929S6
   Features: 1400 RPM, A+++ energy, steam wash, essence wash, WiFi, inverter motor
   Warranty: 10 Years Motor + 2 Years Parts

2. Haier Front Load 8 Kg — Rs. 114,999 (original Rs. 128,000)
   Model: HW80-BP12929S6
   Features: 1200 RPM, A++ energy, inverter motor, child lock
   Warranty: 10 Years Motor + 2 Years Parts

3. Haier Top Load 10 Kg — Rs. 89,999 (original Rs. 98,000)
   Model: HWM 100-316
   Features: 8 wash programs, child lock
   Warranty: 2 Years Brand

4. Haier Top Load 15 Kg — Rs. 109,999 (original Rs. 119,000)
   Model: HWM 150-316
   Features: Heavy duty, 8 wash programs, large family use
   Warranty: 2 Years Brand

LED TVs:
1. Haier 65" QD LED Google TV S800 — Rs. 289,999 (original Rs. 320,000)
   Model: H65S800UX PRO
   Features: 4K UHD, MEMC, bezel-less, Dolby Audio, Google Assistant, HDR10+
   Warranty: 2 Years Brand

2. Haier 55" Mini QLED Google TV M80 — Rs. 219,999 (original Rs. 245,000)
   Model: 55M80
   Features: 4K, Dolby Vision, Dolby Atmos, Google TV
   Warranty: 2 Years Brand

3. Haier 75" QD Mini LED Google TV M90 — Rs. 459,999 (original Rs. 499,000)
   Model: 75M90
   Features: 4K, Dolby Vision & Atmos, flagship model
   Warranty: 2 Years Brand

4. Haier 50" 4K Google LED TV K800 — Rs. 134,999 (original Rs. 149,000)
   Model: H50K85FUX
   Features: 4K UHD, Google TV, voice control
   Warranty: 2 Years Brand

FREEZERS:
1. Haier Deep Freezer 14 Cu Ft — Rs. 119,999 (original Rs. 132,000)
   Model: HDF-385IG — Inverter Grey
   Warranty: 10 Years Compressor

2. Haier Deep Freezer 19 Cu Ft — Rs. 149,999 (original Rs. 165,000)
   Model: HDF-545INV
   Warranty: 10 Years Compressor

3. Haier Deep Freezer 10 Cu Ft — Rs. 89,999 (original Rs. 98,000)
   Model: HDF-285IG
   Warranty: 10 Years Compressor

WATER DISPENSERS:
1. Haier Hot & Cold Dispenser — Rs. 34,999 (original Rs. 39,000)
   Model: HWD-HF1800 — child safety lock

2. Haier Normal & Cold Dispenser — Rs. 24,999 (original Rs. 28,000)
   Model: HWD-CF1800

MICROWAVE OVENS:
1. Haier 20L Solo — Rs. 19,999 | Model: HMN-20MXP5
2. Haier 25L Grill — Rs. 27,999 | Model: HMN-25MEG
3. Haier 28L Air Fryer + Microwave — Rs. 44,999 | Model: HMN-28MXAF

KITCHEN APPLIANCES:
1. Haier T-Shape Range Hood — Rs. 64,999 | Model: HCH-T1901
2. Haier 5 Burner Gas Stove — Rs. 64,999 | Model: HCC-Q57328

SMALL APPLIANCES:
1. Haier Air Fryer 5.5L — Rs. 19,999 | Model: HAF-55D

LAPTOPS:
1. Haier Y11C Intel Core i3 — Rs. 89,999 | 8GB RAM, 256GB SSD, 15.6" FHD, Windows 11
2. Haier Y11C Intel Core i5 — Rs. 119,999 | 8GB RAM, 512GB SSD, 15.6" FHD, Windows 11

COMMON CUSTOMER QUESTIONS & ANSWERS:

Q: Konsa AC best hai Pakistan ke liye?
A: Haier T3 Plus 1.5 Ton best hai — 65 degree temperature mein bhi kaam karta hai, 10 saal warranty, aur bijli bhi kam khata hai.

Q: Inverter AC aur normal AC mein kya farq hai?
A: Inverter AC bijli 60% tak bachata hai, quietly chalta hai, aur zyada durable hota hai. Haier ke saare inverter ACs UPS pe bhi chalte hain.

Q: Delivery kitne din mein hogi?
A: Lahore mein same day ya next day free delivery available hai.

Q: Installation ka kya hoga?
A: Haier official installation team available hai. AC installation ka details WhatsApp pe bata sakte hain: +92 328 6715408

Q: Warranty claim kaise karein?
A: Ali Electronics official Haier store hai — warranty claim directly hamare through hogi. Koi hidden charges nahi.

Q: Kya installment pe mil sakta hai?
A: Ji, easy installment plans available hain. Details ke liye store visit karein ya WhatsApp karein.

Q: Side by side fridge aur normal mein kya farq hai?
A: Side by side mein fridge aur freezer side by side hote hain — zyada space, water dispenser aur ice maker bhi hota hai. Bade families ke liye best hai.

Q: Solar AC kaise kaam karta hai?
A: Haier Solar Hybrid AC din mein solar panels se chalta hai — bijli ka bill zero. Raat ko normal electricity use karta hai.

SALES APPROACH:
- Pehle customer ki zaroorat samjho
- Budget poochho agar nahi bataya
- 2-3 options suggest karo
- Features compare karo simply
- Hamesha official warranty highlight karo
- Free delivery mention karo
- WhatsApp pe further inquiry ke liye guide karo

CLOSING:
- Hamesha WhatsApp number dena: +92 328 6715408
- Store visit invite karna: 493 Lahore Rd, Saddar Cantt
- Hours batana: 9AM-9PM, Monday to Sunday
"""

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    loop = asyncio.get_running_loop()
    conversation_history = [{"role": "system", "content": SYSTEM_PROMPT}]

    deepgram = DeepgramClient(DEEPGRAM_API_KEY)
    dg_connection = deepgram.listen.websocket.v("1")

    # ---------- Deepgram callbacks (run in background threads) ----------

    def on_transcript(self, result, **kwargs):
        try:
            sentence = result.channel.alternatives[0].transcript
            if not sentence.strip():
                return
            # Forward partial transcripts so user sees live feedback
            asyncio.run_coroutine_threadsafe(
                websocket.send_json({"type": "transcript", "text": sentence}),
                loop
            )
            if result.is_final:
                # Schedule AI response as a background task — MUST NOT block this thread
                asyncio.run_coroutine_threadsafe(
                    process_transcript(sentence),
                    loop
                )
        except Exception as e:
            print(f"on_transcript error: {e}")

    def on_error(self, error, **kwargs):
        print(f"Deepgram error: {error}")
        asyncio.run_coroutine_threadsafe(
            websocket.send_json({"type": "error", "text": f"Deepgram error: {error}"}),
            loop
        )

    dg_connection.on(LiveTranscriptionEvents.Transcript, on_transcript)
    dg_connection.on(LiveTranscriptionEvents.Error, on_error)

    # ---------- AI Response pipeline ----------

    async def process_transcript(text: str):
        """Runs concurrently on the event loop — does NOT block the audio receive loop."""
        try:
            conversation_history.append({"role": "user", "content": text})

            # CRITICAL: use asyncio.to_thread for blocking Groq SDK call
            # Without this the entire event loop freezes and Deepgram drops the connection
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

            # Generate TTS audio
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
            print(f"process_transcript error: {e}")
            try:
                await websocket.send_json({"type": "ai_response", "text": f"Error: {str(e)}"})
            except Exception:
                pass

    # ---------- Deepgram options ----------

    options = LiveOptions(
        model="nova-2",
        language="multi",
        smart_format=True,
        interim_results=True,
        punctuate=True,
        endpointing=500,  # detect end of speech after 500ms silence
    )

    # ---------- Main session ----------

    try:
        # Generate greeting — use thread so event loop is never blocked
        greeting_response = await asyncio.to_thread(
            groq_client.chat.completions.create,
            model="llama-3.1-8b-instant",
            messages=conversation_history + [{"role": "user", "content": "greet the customer briefly in 1 sentence"}],
            max_tokens=60,
        )
        greeting_text = greeting_response.choices[0].message.content

        await websocket.send_json({"type": "ai_response", "text": greeting_text})

        communicate = edge_tts.Communicate(text=greeting_text, voice="en-US-JennyNeural")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp_path = tmp.name
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        os.unlink(tmp_path)
        await websocket.send_bytes(audio_bytes)

        # Start Deepgram AFTER greeting is fully done
        dg_connection.start(options)

        # Signal frontend to start sending microphone audio
        await websocket.send_json({"type": "ready"})

        # Audio receive loop — forwards raw mic bytes to Deepgram
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                break
            if message["type"] == "websocket.receive":
                if "text" in message and message["text"] == "ping":
                    continue  # keepalive, ignore
                if "bytes" in message and message["bytes"]:
                    dg_connection.send(message["bytes"])

    except WebSocketDisconnect:
        print("Client disconnected cleanly.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Session error: {e}")
        try:
            await websocket.send_json({"type": "error", "text": f"Session error: {str(e)}"})
        except Exception:
            pass
    finally:
        # Always clean up Deepgram connection
        try:
            dg_connection.finish()
        except Exception:
            pass


@app.get("/health")
def health():
    return {"status": "ok", "agent": "Haier Assistant"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

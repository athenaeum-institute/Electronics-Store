import asyncio
import websockets
import json

async def test():
    uri = "wss://electronics-store-production-597b.up.railway.app/ws/voice"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            while True:
                msg = await websocket.recv()
                if isinstance(msg, str):
                    data = json.loads(msg)
                    print(f"Received JSON: {data}")
                    if data.get("type") == "ready":
                        print("Backend is ready! Sending some dummy audio bytes...")
                        await websocket.send(b"\x00\x00\x00\x00" * 1000) # dummy bytes
                else:
                    print(f"Received binary audio of length {len(msg)}")
                    
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())

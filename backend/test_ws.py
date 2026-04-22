import asyncio
import websockets

async def test():
    uri = "ws://localhost:8000/ws/webcam/test_session/entry"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server.")
            for i in range(10):
                message = await websocket.recv()
                print(f"Received frame {i+1}, length: {len(message)}")
            await websocket.send("stop")
    except Exception as e:
        print(f"Connection failed: {e}")

asyncio.run(test())

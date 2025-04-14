from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dummy data
with open("../dummyData.json", "r") as f:
    DUMMY_DATA = json.load(f)

@app.get("/api/data")
def get_data():
    """
    Returns dummy data (e.g., list of users).
    """
    return DUMMY_DATA

# @app.post("/api/ai")
# async def ai_endpoint(request: Request):
#     """
#     Accepts a user question and returns a placeholder AI response.
#     (Optionally integrate a real AI model or external service here.)
#     """
#     body = await request.json()
#     user_question = body.get("question", "")
    
#     # Placeholder logic: echo the question or generate a simple response
#     # Replace with real AI logic as desired (e.g., call to an LLM).
#     return {"answer": f"This is a placeholder answer to your question: {user_question}"}

from openai import OpenAI # openai==1.52.2

@app.post("/api/ai")
async def ai_endpoint(request: Request):
    # Access the raw request body
    body = await request.json()  # Asynchronously get the JSON body
    user_question = body.get("question", "")  # Extract the question from the request

    # Call real AI model like Upstage Solar
    client = OpenAI(
        api_key="up_ArnC9xcKyYNMQCK4j6AbE2PuMPZ0f",
        base_url="https://api.upstage.ai/v1"
    )
 
    stream = client.chat.completions.create(
        model="solar-pro",
        messages=[
            {
                "role": "user",
                "content": user_question
            }
        ],
        stream=True,
    )
    
    answer = ""
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            content_piece = chunk.choices[0].delta.content
            answer += content_piece    

    return {"answer": answer}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Get API key from .env
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        print("📩 User message received:", user_message)

        # Prepare request to OpenRouter
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",  # You can also try: "mistralai/mistral-7b-instruct"
                "messages": [
                    {"role": "system", "content": "You are a supportive and empathetic mental health assistant."},
                    {"role": "user", "content": user_message}
                ]
            }
        )

        # Parse response
        result = response.json()
        print("📦 Full API response:", result)

        # Handle missing choices (error handling)
        if "choices" not in result:
            return jsonify({"error": "API response did not include 'choices'", "details": result}), 500

        bot_reply = result["choices"][0]["message"]["content"]
        print("🤖 Bot reply:", bot_reply)

        return jsonify({"reply": bot_reply})

    except Exception as e:
        print("❌ ERROR during API call:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

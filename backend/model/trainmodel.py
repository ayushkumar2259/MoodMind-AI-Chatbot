import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

# Dataset
data = {
    "text": [
        "I feel sad", "I'm so depressed", "I'm anxious", "I'm happy",
        "I feel good", "I can't sleep", "I need help", "I'm lonely"
    ],
    "label": ["sad", "sad", "anxious", "happy", "happy", "insomnia", "help", "lonely"]
}

df = pd.DataFrame(data)

# Train
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])
y = df["label"]

model = LogisticRegression()
model.fit(X, y)

# Save to model/intent_model.pkl
os.makedirs("backend/model", exist_ok=True)
with open("backend/model/intent_model.pkl", "wb") as f:
    pickle.dump((model, vectorizer), f)

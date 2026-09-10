import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb
import os
import json
import joblib

DATA_FILE = "backend/data/csi_training_data.csv"
MODEL_FILE = "backend/models/xgboost_csi_model.json"
ENCODER_FILE = "backend/models/label_encoder.pkl"

def train_model():
    print("\n=============================================")
    print("  WiSense Edge AI - XGBoost Model Trainer    ")
    print("=============================================\n")

    if not os.path.exists(DATA_FILE):
        print(f"[ERROR] Training data not found at {DATA_FILE}")
        print("Please run scripts/collect_training_data.py first!")
        return

    print("[1/5] Loading and preprocessing dataset...")
    df = pd.read_csv(DATA_FILE)
    print(f"  Loaded {len(df)} total samples.")
    
    # Feature columns (the 51 subcarriers)
    feature_cols = [f"subcarrier_{i}" for i in range(51)]
    X = df[feature_cols].values
    
    # Label encoding
    le = LabelEncoder()
    y = le.fit_transform(df['label'])
    
    print(f"  Detected Classes: {list(le.classes_)}")
    if len(le.classes_) < 2:
        print("\n[ERROR] You only have data for 1 zone. XGBoost requires at least 2 distinct zones (e.g. A1 and EMPTY) to train.")
        return

    print("\n[2/5] Splitting dataset (80% Train / 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples: {len(X_test)}")

    print("\n[3/5] Initializing XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective="multi:softmax",
        num_class=len(le.classes_),
        eval_metric="mlogloss",
        n_jobs=-1
    )

    print("\n[4/5] Training model (this may take a few seconds)...")
    model.fit(X_train, y_train)

    print("\n[5/5] Evaluating performance on test set...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n  Model Accuracy: {accuracy * 100:.2f}%")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save the model
    os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
    model.save_model(MODEL_FILE)
    joblib.dump(le, ENCODER_FILE)
    print(f"\n[SUCCESS] Model saved to {MODEL_FILE}")
    print(f"[SUCCESS] Encoder saved to {ENCODER_FILE}")
    print("\nYou can now start backend/server.py! It will automatically load the XGBoost model for LIVE inference.")

if __name__ == "__main__":
    train_model()

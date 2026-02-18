import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

def clean_text(val):
    return str(val).strip().lower()

# load
df = pd.read_csv(r"D:\PYTHON PROJECTS\code\loan_approval_dataset.csv")

# CLEAN COLUMN NAMES FIRST
df.columns = df.columns.str.strip().str.lower()
print("Columns after cleaning:", df.columns.tolist())

# remove id
df = df.drop(columns=["loan_id"])

# encode
encoders = {}
for col in ["education", "self_employed", "loan_status"]:
    df[col] = df[col].apply(clean_text)
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# split
X = df.drop(columns=["loan_status"])
y = df["loan_status"]

feature_columns = list(X.columns)
print("Feature columns saved:", feature_columns)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=200, max_depth=8)
model.fit(X_train, y_train)

# save
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/loan_model.pkl")
joblib.dump(encoders, "models/loan_encoders.pkl")
joblib.dump(feature_columns, "models/loan_columns.pkl")

print("Loan model saved successfully!")

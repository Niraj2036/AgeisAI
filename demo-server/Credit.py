import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from xgboost import XGBClassifier

# ---------- load ----------
df = pd.read_csv("creditcard.csv")

X = df.drop("Class", axis=1)
y = df["Class"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ---------- RF ----------
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    class_weight="balanced",
    n_jobs=-1,
    random_state=42
)
rf.fit(X_train, y_train)
rf_pred = rf.predict(X_test)

# ---------- XGB ----------
scale = (y_train == 0).sum() / (y_train == 1).sum()

xgb = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale,
    eval_metric="logloss",
    use_label_encoder=False,
    random_state=42
)
xgb.fit(X_train, y_train)
xgb_pred = xgb.predict(X_test)

# ---------- select by recall ----------
rf_recall = classification_report(y_test, rf_pred, output_dict=True)["1"]["recall"]
xgb_recall = classification_report(y_test, xgb_pred, output_dict=True)["1"]["recall"]

if xgb_recall > rf_recall:
    model = xgb
    name = "XGBoost"
else:
    model = rf
    name = "RandomForest"

print("Selected Fraud Model:", name)

# ---------- save ----------
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/fraud_model.pkl")

print("Fraud model saved successfully!")

feature_columns = X.columns.tolist()
joblib.dump(feature_columns, "models/fraud_columns.pkl")

import sys


def patch_sklearn():
    try:
        from sklearn.base import BaseEstimator
        from .trackers.ml import wrap_predict

        BaseEstimator.predict = wrap_predict(BaseEstimator.predict)

        print("[AegisAI] sklearn instrumentation enabled")

    except Exception as e:
        print("sklearn patch failed:", e)


def auto_patch():

    # ML
    if "sklearn" in sys.modules:
        patch_sklearn()

    # Gemini
    try:
        import google.generativeai
        from .trackers.gemini import patch_gemini
        patch_gemini()
    except:
        pass

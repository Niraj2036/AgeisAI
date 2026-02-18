import time
from ..buffer import add_llm_event


def patch_gemini():

    try:
        import google.generativeai as genai

        original = genai.GenerativeModel.generate_content

        def wrapped(self, prompt, *args, **kwargs):

            start = time.time()

            response = original(self, prompt, *args, **kwargs)

            latency = time.time() - start

            try:
                output_text = response.text
            except:
                output_text = str(response)

            event = {
                "provider": "gemini",
                "model": getattr(self, "model_name", "unknown"),
                "prompt": str(prompt)[:500],
                "response": output_text[:500],
                "latency": latency,
                "timestamp": time.time()
            }

            add_llm_event(event)

            return response

        genai.GenerativeModel.generate_content = wrapped

        print("[AegisAI] Gemini instrumentation enabled")

    except Exception as e:
        print("[AegisAI] Gemini patch failed:", e)

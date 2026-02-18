import time
from ..buffer import add_ml_event


def wrap_predict(original_predict):

    def wrapper(self, X, *args, **kwargs):

        start = time.time()

        output = original_predict(self, X, *args, **kwargs)

        latency = time.time() - start

        event = {
            "model_id": f"{type(self).__name__}_{id(self)}",
            "framework": "sklearn",
            "input_shape": str(getattr(X, "shape", None)),
            "output": str(output)[:200],
            "latency": latency,
            "timestamp": time.time()
        }

        add_ml_event(event)

        return output

    return wrapper

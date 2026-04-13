import tensorflow as tf
import numpy as np
from PIL import Image
import pickle

from tensorflow.keras.models import load_model
from tensorflow.keras.mixed_precision import Policy

# Safe layer fix
class SafeLayer(tf.keras.layers.Layer):
    def __init__(self, *args, **kwargs):
        kwargs.pop("batch_shape", None)
        kwargs.pop("optional", None)
        kwargs.pop("synchronized", None)
        super().__init__(*args, **kwargs)

# Load model
model = load_model(
    "leaf_model.keras",
    compile=False,
    custom_objects={
        "InputLayer": SafeLayer,
        "DTypePolicy": Policy
    }
)

# Load encoders
with open("crop_encoder.pkl", "rb") as f:
    crop_encoder = pickle.load(f)

with open("disease_encoder.pkl", "rb") as f:
    disease_encoder = pickle.load(f)

print("Model + Encoders Loaded")

# Prediction function
def predict(image: Image.Image):
    img = image.convert("RGB")
    img = img.resize((160, 160))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)

    pred_crop, pred_disease = model.predict(img, verbose=0)

    crop_idx = int(np.argmax(pred_crop))
    disease_idx = int(np.argmax(pred_disease))

    crop = crop_encoder.classes_[crop_idx]
    disease = disease_encoder.classes_[disease_idx]

    if "__" in disease:
        disease = disease.split("__")[-1]

    return {
        "crop": crop,
        "disease": disease,
        "confidence": {
            "crop": float(np.max(pred_crop)),
            "disease": float(np.max(pred_disease))
        }
    }
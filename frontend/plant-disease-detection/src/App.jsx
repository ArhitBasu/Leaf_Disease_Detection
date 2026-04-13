import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload an image");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(res.data);
    } catch (err) {
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">🌿 Plant Disease Detector</h1>
        <p className="subtitle">AI-powered leaf analysis</p>

        <input type="file" onChange={handleFileChange} />

        {preview && (
          <img src={preview} alt="preview" className="preview" />
        )}

        <button onClick={handleUpload}>
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>

        {loading && <div className="loader"></div>}

        {result && (
          <div className="result">
            <h2>Prediction</h2>

            <p><strong>🌱 Crop:</strong> {result.crop}</p>
            <p><strong>🌿 Disease:</strong> {result.disease}</p>

            <div className="bar">
              <span>
                Crop Confidence: {(result.confidence.crop * 100).toFixed(2)}%
              </span>
              <div className="progress">
                <div
                  style={{
                    width: `${result.confidence.crop * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bar">
              <span>
                Disease Confidence: {(result.confidence.disease * 100).toFixed(2)}%
              </span>
              <div className="progress">
                <div
                  style={{
                    width: `${result.confidence.disease * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
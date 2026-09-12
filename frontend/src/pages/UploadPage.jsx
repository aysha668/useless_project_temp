import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScanAnimation from '../components/ScanAnimation';
import { analyzeImage, getDemoList, runDemo } from '../services/api';
import { safeSetSessionStorage } from '../utils/formatters';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [demos, setDemos] = useState([]);

  useEffect(() => {
    getDemoList().then(setDemos).catch(() => {});
  }, []);

  const handleFile = useCallback((f) => {
    setError(null);
    if (!ACCEPTED.includes(f.type)) {
      setError('Invalid file type. Accepted: JPG, JPEG, PNG, WEBP.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const analyze = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    try {
      const result = await analyzeImage(file);
      safeSetSessionStorage('lastAnalysis', result);
      navigate(`/dashboard/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed.');
    } finally {
      setScanning(false);
    }
  };

  const tryDemo = async (name) => {
    setScanning(true);
    setError(null);
    try {
      const result = await runDemo(name);
      safeSetSessionStorage('lastAnalysis', result);
      navigate(`/dashboard/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo analysis failed. Ensure backend is running.');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('demo') === '1' && demos.length) {
      tryDemo(demos[0].name);
    }
  }, [demos, searchParams]);

  return (
    <div className="upload-page">
      <ScanAnimation active={scanning} imagePreview={preview} />

      <h1>Upload Display Evidence</h1>
      <p className="upload-hint">For best results, upload a clear photograph of the damaged display.</p>

      {/* ── Phone Screen Tips Banner ── */}
      <div className="screen-tips-banner glass">
        <div className="screen-tip">
          <span className="tip-icon">📵</span>
          <div>
            <strong>Turn the phone screen OFF</strong>
            <p>Take the photo with the screen powered off (just cracks / physical damage visible). An active screen creates glare and false lines that corrupt analysis.</p>
          </div>
        </div>
        <div className="screen-tip">
          <span className="tip-icon">🚫</span>
          <div>
            <strong>No watermarks / overlays</strong>
            <p>Timestamps, camera watermarks, or sticker overlays on the image will be detected as damage lines.</p>
          </div>
        </div>
        <div className="screen-tip">
          <span className="tip-icon">💡</span>
          <div>
            <strong>Good lighting, steady shot</strong>
            <p>Photograph in natural light, flat on a plain surface — avoid glare and motion blur for accurate line detection.</p>
          </div>
        </div>
      </div>

      {/* ── Drop Zone ── */}
      <div
        className={`dropzone glass ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          hidden
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        {preview ? (
          <div className="preview-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Preview" className="preview-image" />
            {file && (
              <div className="file-info">
                <span>{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="drop-icon">📷</div>
            <p>Drag &amp; drop your broken screen here</p>
            <p className="or">or</p>
            <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              Browse Files
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* ── Actions ── */}
      <div className="upload-actions">
        <button className="btn btn-primary" disabled={!file || scanning} onClick={analyze}>
          ANALYZE
        </button>
        {file && (
          <button className="btn btn-secondary" onClick={() => { setFile(null); setPreview(null); }}>
            Reset
          </button>
        )}
      </div>

      {demos.length > 0 && (
        <div className="demo-section glass">
          <h3>TRY SAMPLE</h3>
          <div className="demo-buttons">
            {demos.map((d) => (
              <button key={d.name} className="btn btn-demo" disabled={scanning} onClick={() => tryDemo(d.name)}>
                {d.name.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

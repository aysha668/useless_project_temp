import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 502 || error.response?.status === 503) {
      error.message = 'Backend server is not running on http://127.0.0.1:8000. Please start the backend with run_backend.bat or uvicorn.';
    }
    return Promise.reject(error);
  }
);

export async function analyzeImage(file, crop = null) {
  const form = new FormData();
  form.append('file', file);
  if (crop) form.append('crop', JSON.stringify(crop));
  const { data } = await api.post('/analyze', form);
  return data;
}

export async function compareImages(fileA, fileB) {
  const form = new FormData();
  form.append('file_a', fileA);
  form.append('file_b', fileB);
  const { data } = await api.post('/compare', form);
  return data;
}

export async function getAnalysis(id) {
  const { data } = await api.get(`/analysis/${id}`);
  return data;
}

export function getReportUrl(id) {
  return `/api/report/${id}`;
}

export async function getDemoList() {
  const { data } = await api.get('/demo-list');
  return data.samples;
}

export async function runDemo(sampleName) {
  const { data } = await api.get(`/demo/${sampleName}`);
  return data;
}

export default api;

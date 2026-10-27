import * as ort from 'onnxruntime-web/webgpu';
import { registerBackgroundWorker } from './background-remover-worker.runtime';

registerBackgroundWorker(ort, 'webgpu');

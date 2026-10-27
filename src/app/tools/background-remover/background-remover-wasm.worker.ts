import * as ort from 'onnxruntime-web/wasm';
import { registerBackgroundWorker } from './background-remover-worker.runtime';

registerBackgroundWorker(ort, 'wasm');

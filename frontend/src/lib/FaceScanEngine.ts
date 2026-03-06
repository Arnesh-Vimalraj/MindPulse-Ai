import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface Point {
    x: number;
    y: number;
}

export interface FaceScanState {
    status: 'idle' | 'initializing' | 'detecting' | 'stabilizing' | 'streaming' | 'error';
    errorMessage?: string;
    stabilityScore: number;
    bufferCount: number;
    facesDetected: number;
    heartRate?: number;
    spo2?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    hrv?: { sdnn: number; rmssd: number };
    stressLevel?: string;
    confidence?: number;
    pulseWaveform?: number[];
    scanError?: string;
}

export type StateCallback = (state: FaceScanState) => void;

interface FramePayload {
    timestamp: number;
    frame_id: number;
    forehead_roi: string;
    left_cheek_roi: string;
    right_cheek_roi: string;
    stability: number;
}

export class FaceScanEngine {
    // Video & Canvas
    private videoEl: HTMLVideoElement | null = null;
    private renderCanvas: HTMLCanvasElement | null = null;
    private renderCtx: CanvasRenderingContext2D | null = null;
    private extractionCanvas: HTMLCanvasElement;
    private extractionCtx: CanvasRenderingContext2D;

    // MediaPipe
    private faceLandmarker: FaceLandmarker | null = null;
    private isLandmarkerLoaded = false;

    // State
    private state: FaceScanState = {
        status: 'idle',
        stabilityScore: 0,
        bufferCount: 0,
        facesDetected: 0,
        heartRate: undefined,
        spo2: undefined,
        bloodPressure: undefined,
        hrv: undefined,
        stressLevel: undefined,
        confidence: 0,
        scanError: undefined
    };
    private callbacks: StateCallback[] = [];

    // Pipeline loops
    private stream: MediaStream | null = null;
    private requestAnimationFrameId: number | null = null;
    private frameCount = 0;

    // Stability Window
    private STABILITY_WINDOW_SIZE = 30; // 30 frames
    private stabilityHistory: boolean[] = [];

    // Buffer
    private BUFFER_CAPACITY = 150;
    private frameBuffer: FramePayload[] = [];

    // WebSocket
    private ws: WebSocket | null = null;
    private WS_URL = 'ws://localhost:8000/scan';

    // ROI Settings
    private ROI_SIZE = 72;
    private lastStreamTime = 0;
    private TARGET_FPS = 15;

    constructor() {
        // Hidden canvas for extracting image patches
        this.extractionCanvas = document.createElement('canvas');
        this.extractionCanvas.width = this.ROI_SIZE;
        this.extractionCanvas.height = this.ROI_SIZE;
        this.extractionCtx = this.extractionCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Attempt to load MediaPipe immediately
        this.initMediaPipe();
    }

    // --- PUBLIC API ---

    public onStateChange(callback: StateCallback) {
        this.callbacks.push(callback);
        callback(this.state);
    }

    public async start(videoElement: HTMLVideoElement, overlayCanvas: HTMLCanvasElement) {
        this.videoEl = videoElement;
        this.renderCanvas = overlayCanvas;
        this.renderCtx = overlayCanvas.getContext('2d');

        this.updateState({ status: 'initializing', errorMessage: undefined });
        console.log("[FaceScanEngine] Starting initialization...");

        try {
            // 1. Request Camera
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, min: 1280 },
                    height: { ideal: 720, min: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            });

            this.videoEl.srcObject = this.stream;
            await new Promise<void>((resolve) => {
                if (!this.videoEl) return;
                this.videoEl.onloadedmetadata = () => {
                    this.videoEl?.play();
                    resolve();
                };
            });

            console.log("[FaceScanEngine] Camera initialized successfully at", this.videoEl.videoWidth, "x", this.videoEl.videoHeight);

            // Setup canvas sizes
            this.renderCanvas.width = this.videoEl.videoWidth;
            this.renderCanvas.height = this.videoEl.videoHeight;

            // 2. Wait for MediaPipe if not ready
            if (!this.isLandmarkerLoaded) {
                await this.initMediaPipe();
            }

            // 3. Setup WebSocket
            this.connectWebSocket();

            // Start the render/processing loop
            this.updateState({ status: 'detecting' });
            this.processFrame();

        } catch (err: any) {
            console.error("[FaceScanEngine] Initialization error:", err);
            let errorMsg = 'Failed to access camera.';
            if (err.name === 'NotAllowedError') errorMsg = 'Camera permission denied.';
            else if (err.name === 'NotFoundError') errorMsg = 'No camera device found.';

            this.updateState({ status: 'error', errorMessage: errorMsg });
        }
    }

    public stop() {
        console.log("[FaceScanEngine] Stopping engine...");

        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
            this.requestAnimationFrameId = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoEl) {
            this.videoEl.srcObject = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.renderCtx && this.renderCanvas) {
            this.renderCtx.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        }

        this.stabilityHistory = [];
        this.frameBuffer = [];

        this.updateState({
            status: 'idle',
            stabilityScore: 0,
            bufferCount: 0,
            facesDetected: 0
        });
    }

    // --- INTERNAL PIPELINE ---

    private async initMediaPipe() {
        if (this.isLandmarkerLoaded) return;
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 2 // We allow 2 to detect if there are *multiple* faces and reject them
            });
            this.isLandmarkerLoaded = true;
            console.log("[FaceScanEngine] MediaPipe FaceLandmarker loaded.");
        } catch (err) {
            console.error("[FaceScanEngine] Failed to load MediaPipe:", err);
            this.updateState({ status: 'error', errorMessage: 'Failed to load AI models.' });
        }
    }

    private connectWebSocket() {
        try {
            this.ws = new WebSocket(this.WS_URL);
            this.ws.onopen = () => console.log("[FaceScanEngine] WebSocket connected to backend.");
            this.ws.onerror = (e) => console.error("[FaceScanEngine] WebSocket error:", e);
            this.ws.onclose = () => console.log("[FaceScanEngine] WebSocket closed.");
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.error) {
                        this.updateState({ scanError: data.error });
                        console.error("[FaceScanEngine] Scan Error:", data.error);
                        return;
                    }

                    if (data.heart_rate !== undefined) {
                        this.updateState({
                            heartRate: data.heart_rate,
                            spo2: data.spo2,
                            bloodPressure: data.blood_pressure,
                            hrv: data.hrv,
                            stressLevel: data.stress_level,
                            confidence: data.confidence,
                            pulseWaveform: data.pulse_waveform,
                            scanError: undefined
                        });
                        console.log("[FaceScanEngine] Received full vitals:", data);
                    }
                } catch (e) {
                    console.error("[FaceScanEngine] Failed to parse WebSocket message:", e);
                }
            };
        } catch (err) {
            console.error("[FaceScanEngine] Failed to connect WebSocket:", err);
        }
    }

    private processFrame = async () => {
        if (!this.videoEl || !this.faceLandmarker || !this.renderCtx || !this.renderCanvas) return;

        const startTime = performance.now();

        // Clear render canvas
        this.renderCtx.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);

        // Predict Landmarks
        let results: FaceLandmarkerResult | null = null;
        try {
            // mediapipe requires video timestamps in MS
            results = this.faceLandmarker.detectForVideo(this.videoEl, startTime);
        } catch (e) {
            console.error("Detection error", e);
        }

        if (results && results.faceLandmarks) {
            const numFaces = results.faceLandmarks.length;
            this.updateState({ facesDetected: numFaces });

            const isStable = this.checkStability(results);

            if (numFaces === 1) {
                const landmarks = results.faceLandmarks[0];

                // Always draw UI feedback
                this.drawOverlay(landmarks);

                // If stable, extract and buffer data
                if (isStable) {
                    if (this.state.status !== 'streaming') {
                        this.updateState({ status: 'streaming' });
                    }

                    // Throttle extraction to ~15fps (every ~66ms)
                    const now = performance.now();
                    if (now - this.lastStreamTime >= (1000 / this.TARGET_FPS)) {
                        this.lastStreamTime = now;
                        await this.extractAndBuffer(landmarks);
                    }
                } else {
                    if (this.state.status === 'streaming') {
                        this.updateState({ status: 'stabilizing' });
                    } else if (this.state.status === 'detecting') {
                        this.updateState({ status: 'stabilizing' });
                    }
                }
            } else if (numFaces > 1) {
                // Multiple faces logic
                this.drawWarning("Multiple faces detected. Please ensure only you are in frame.");
                if (this.state.status === 'streaming') this.updateState({ status: 'stabilizing' });
            } else {
                // No faces
                if (this.state.status !== 'detecting') this.updateState({ status: 'detecting' });
            }
        }

        const latency = performance.now() - startTime;
        if (this.frameCount % 30 === 0) {
            // Log latency occasionally
            // console.log(`[FaceScanEngine] Detection Latency: ${latency.toFixed(2)}ms`);
        }

        this.frameCount++;
        this.requestAnimationFrameId = requestAnimationFrame(this.processFrame);
    }

    // --- STABILITY --- //

    private checkStability(results: FaceLandmarkerResult): boolean {
        if (results.faceLandmarks.length !== 1) {
            this.addStabilityRecord(false);
            return false;
        }

        const landmarks = results.faceLandmarks[0];

        // 1. Check Face Size (at least 30% of height)
        // top of head is roughly landmark 10, chin is 152
        const faceHeight = Math.abs(landmarks[152].y - landmarks[10].y);
        const sizeValid = faceHeight > 0.3; // 30% of screen height

        // 2. Check Orientation (Yaw/Pitch proxy)
        // Compare nose tip (1) to edges of face (234 left, 454 right)
        const nose = landmarks[1];
        const leftEdge = landmarks[234];
        const rightEdge = landmarks[454];

        const distLeft = Math.abs(nose.x - leftEdge.x);
        const distRight = Math.abs(rightEdge.x - nose.x);

        // Ratio should be somewhat balanced if looking forward
        // If ratio > 2 or < 0.5, head is turned
        const ratio = distLeft / (distRight + 0.0001);
        const isCentered = ratio > 0.5 && ratio < 2.0;

        const isFrameValid = sizeValid && isCentered;
        this.addStabilityRecord(isFrameValid);

        // Calculate score (percentage of stable frames in window)
        const validCount = this.stabilityHistory.filter(Boolean).length;
        const score = Math.round((validCount / this.STABILITY_WINDOW_SIZE) * 100);

        if (this.frameCount % 5 === 0) {
            this.updateState({ stabilityScore: score });
        }

        // Requires 100% of the last 30 frames to be stable
        return validCount === this.STABILITY_WINDOW_SIZE;
    }

    private addStabilityRecord(isValid: boolean) {
        this.stabilityHistory.push(isValid);
        if (this.stabilityHistory.length > this.STABILITY_WINDOW_SIZE) {
            this.stabilityHistory.shift();
        }
    }


    // --- ROI EXTRACTION --- //

    private async extractAndBuffer(landmarks: NormalizedLandmark[]) {
        if (!this.videoEl) return;

        const vw = this.videoEl.videoWidth;
        const vh = this.videoEl.videoHeight;

        // Extract Base64 Images specifically from regions
        // MediaPipe landmarks indices:
        // Forehead center roughly: 151
        // Left cheek roughly: 205
        // Right cheek roughly: 425

        const foreheadROI = this.cropROI(landmarks[151], vw, vh);
        const leftCheekROI = this.cropROI(landmarks[205], vw, vh);
        const rightCheekROI = this.cropROI(landmarks[425], vw, vh);

        // Current frame stability (0 or 1)
        const frameStability = this.stabilityHistory.length > 0 ? (this.stabilityHistory[this.stabilityHistory.length - 1] ? 1 : 0) : 0;

        const payload: FramePayload = {
            timestamp: Date.now(),
            frame_id: this.frameCount,
            forehead_roi: foreheadROI,
            left_cheek_roi: leftCheekROI,
            right_cheek_roi: rightCheekROI,
            stability: frameStability
        };

        // Add to Circular Buffer (FIFO)
        this.frameBuffer.push(payload);
        if (this.frameBuffer.length > this.BUFFER_CAPACITY) {
            this.frameBuffer.shift();
        }

        this.updateState({ bufferCount: this.frameBuffer.length });

        // Stream to Backend
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(payload));
            } catch (e) {
                console.error("[FaceScanEngine] WebSocket send failed", e);
            }
        }
    }

    private cropROI(centerPoint: NormalizedLandmark, vw: number, vh: number): string {
        if (!this.videoEl) return "";

        const x = Math.floor(centerPoint.x * vw);
        const y = Math.floor(centerPoint.y * vh);

        // Calculate bounding box for ROI with fallback to edges
        const halfSize = this.ROI_SIZE / 2;
        const sx = Math.max(0, x - halfSize);
        const sy = Math.max(0, y - halfSize);

        const cropW = Math.min(this.ROI_SIZE, vw - sx);
        const cropH = Math.min(this.ROI_SIZE, vh - sy);

        // Draw onto the hidden 72x72 canvas
        this.extractionCtx.clearRect(0, 0, this.ROI_SIZE, this.ROI_SIZE);

        // Handle edge cases where the crop might be smaller than ROI_SIZE
        // Center the smaller crop in the 72x72 canvas
        const dx = (this.ROI_SIZE - cropW) / 2;
        const dy = (this.ROI_SIZE - cropH) / 2;

        this.extractionCtx.drawImage(
            this.videoEl,
            sx, sy, cropW, cropH, // Source
            dx, dy, cropW, cropH  // Destination
        );

        // Compress to jpeg quality 0.8
        // Note: In production Chrome supports webp which is smaller
        return this.extractionCanvas.toDataURL('image/jpeg', 0.8);
    }

    // --- DRAWING & UI --- //

    private drawOverlay(landmarks: NormalizedLandmark[]) {
        if (!this.renderCtx || !this.renderCanvas) return;
        const ctx = this.renderCtx;
        const w = this.renderCanvas.width;
        const h = this.renderCanvas.height;

        // Draw face mesh points (subsampled for performance)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; // Tailwind sky-400
        for (let i = 0; i < landmarks.length; i += 5) {
            const pt = landmarks[i];
            ctx.beginPath();
            ctx.arc(pt.x * w, pt.y * h, 1, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw ROI bounding boxes to show where we are extracting
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; // Emerald-500
        ctx.lineWidth = 2;

        const roiPts = [151, 205, 425]; // Forehead, left cheek, right cheek
        roiPts.forEach((index) => {
            const pt = landmarks[index];
            const x = pt.x * w;
            const y = pt.y * h;
            ctx.strokeRect(x - (this.ROI_SIZE / 2), y - (this.ROI_SIZE / 2), this.ROI_SIZE, this.ROI_SIZE);
        });

        // Draw centering guide ellipse
        const isCentered = this.state.stabilityScore > 80;
        ctx.strokeStyle = isCentered ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'; // Emerald vs Rose
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Roughly center of screen oval
        ctx.ellipse(w / 2, h / 2, h * 0.25, h * 0.35, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    private drawWarning(msg: string) {
        if (!this.renderCtx || !this.renderCanvas) return;
        const ctx = this.renderCtx;
        const w = this.renderCanvas.width;
        const h = this.renderCanvas.height;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'white';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msg, w / 2, h / 2);
    }

    private updateState(partial: Partial<FaceScanState>) {
        this.state = { ...this.state, ...partial };
        // Notify listeners
        this.callbacks.forEach(cb => cb(this.state));
    }
}

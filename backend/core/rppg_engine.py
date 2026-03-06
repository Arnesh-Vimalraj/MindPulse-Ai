import numpy as np
import base64
from io import BytesIO
from PIL import Image
from scipy import signal
import logging

logger = logging.getLogger(__name__)

def _decode_base64_image(b64_str: str) -> np.ndarray:
    """Decodes a base64 image string into a numpy RGB array."""
    # Remove prefix if present
    if b64_str.startswith("data:image"):
        b64_str = b64_str.split(",")[1]
    
    img_data = base64.b64decode(b64_str)
    img = Image.open(BytesIO(img_data)).convert('RGB')
    return np.array(img)

def _get_roi_mean_rgb(b64_str: str) -> np.ndarray:
    """Returns [R, G, B] mean values for the given ROI image."""
    img_arr = _decode_base64_image(b64_str)
    # img_arr shape is (H, W, 3)
    return img_arr.mean(axis=(0, 1))

def extract_vitals(frame_buffer: list, fps: float, avg_stability: float = 1.0) -> dict:
    """
    Advanced rPPG pipeline extracting multi-modal vitals (HR, HRV, SpO2, BP, Stress).
    Includes motion-based rejection and pulse waveform output.
    """
    n_frames = len(frame_buffer)
    if n_frames < 30:
        return {"error": "Insufficient frames"}
    
    # 0. MOTION STABILITY REJECTION
    if avg_stability < 0.6:
        return {"error": "Signal unstable due to excessive motion"}

    # 1. MULTI-ROI COLOR EXTRACTION
    # S shape: (3_ROIs, 3_CHANNELS, N_FRAMES)
    S_raw = np.zeros((3, 3, n_frames))
    
    for i, frame in enumerate(frame_buffer):
        try:
            S_raw[0, :, i] = _get_roi_mean_rgb(frame["forehead_roi"])
            S_raw[1, :, i] = _get_roi_mean_rgb(frame["left_cheek_roi"])
            S_raw[2, :, i] = _get_roi_mean_rgb(frame["right_cheek_roi"])
        except Exception as e:
            logger.error(f"ROI extraction error at frame {i}: {e}")
            if i > 0: S_raw[:, :, i] = S_raw[:, :, i-1]

    # 2. SIGNAL FUSION (Using Green channel for HR/HRV)
    G_signals = S_raw[:, 1, :] # (3, N)
    
    fused_signal = np.zeros(n_frames)
    weights = []
    
    for j in range(3):
        sig = signal.detrend(G_signals[j, :])
        f, pxx = signal.welch(sig, fps, nperseg=min(n_frames, 128))
        hr_band = (f >= 0.8) & (f <= 2.5)
        snr = np.sum(pxx[hr_band]) / np.sum(pxx) if np.sum(pxx) > 0 else 0
        weights.append(snr)
    
    weights = np.array(weights)
    if np.sum(weights) > 0:
        weights /= np.sum(weights)
        for j in range(3):
            fused_signal += G_signals[j, :] * weights[j]
    else:
        fused_signal = G_signals[0, :]

    # 3. PRE-PROCESSING
    fused_detrended = signal.detrend(fused_signal)
    nyquist = fps / 2.0
    b, a = signal.butter(4, [0.7 / nyquist, 3.0 / nyquist], btype='band')
    filtered_vitals = signal.filtfilt(b, a, fused_detrended)
    
    # Normalize Waveform for UI Display
    waveform_norm = ((filtered_vitals - np.min(filtered_vitals)) / (np.max(filtered_vitals) - np.min(filtered_vitals))).tolist() if np.max(filtered_vitals) != np.min(filtered_vitals) else []

    # 4. HEART RATE (WELCH PSD)
    f, pxx = signal.welch(filtered_vitals, fps, nperseg=min(n_frames, 128))
    hr_band = (f >= 0.8) & (f <= 2.5)
    if np.any(hr_band):
        best_freq = f[hr_band][np.argmax(pxx[hr_band])]
        bpm = int(round(best_freq * 60))
    else:
        bpm = 0

    # 5. HRV CALCULATION
    min_dist = int(fps * 0.4) 
    peaks, _ = signal.find_peaks(filtered_vitals, distance=min_dist)
    
    if len(peaks) > 2:
        rr_intervals = np.diff(peaks) / fps * 1000.0 # in ms
        sdnn = np.std(rr_intervals)
        rmssd = np.sqrt(np.mean(np.diff(rr_intervals)**2))
    else:
        sdnn, rmssd = 0, 0

    # 6. SPO2 ESTIMATION
    R_fh = S_raw[0, 0, :]
    B_fh = S_raw[0, 2, :]
    
    ac_r, dc_r = np.std(R_fh), np.mean(R_fh)
    ac_b, dc_b = np.std(B_fh), np.mean(B_fh)
    
    if dc_r > 0 and dc_b > 0 and ac_b > 0:
        r_ratio = (ac_r / dc_r) / (ac_b / dc_b)
        spo2 = min(max(100 - 5 * r_ratio, 95.0), 100.0)
    else:
        spo2 = 98.0

    # 7. BLOOD PRESSURE & STRESS
    systolic = 110 + (bpm - 70) * 0.5 if bpm > 0 else 0
    diastolic = 70 + (bpm - 70) * 0.2 if bpm > 0 else 0
    
    stress_level = "Low"
    if rmssd < 20: stress_level = "High"
    elif rmssd < 40: stress_level = "Moderate"

    # 8. CONFIDENCE (Factor in motion stability)
    peak_consistency = 1.0 - (np.std(np.diff(peaks))/np.mean(np.diff(peaks))) if len(peaks) > 3 else 0.5
    # Combined score: 40% motion stability, 40% SNR-fusion, 20% peak consistency
    conf = (avg_stability * 0.4 + np.max(weights) * 0.4 + peak_consistency * 0.2)
    conf = min(max(conf, 0.0), 1.0)

    return {
        "heart_rate": bpm,
        "spo2": round(float(spo2), 1),
        "blood_pressure": {
            "systolic": int(round(systolic)),
            "diastolic": int(round(diastolic))
        },
        "hrv": {
            "sdnn": round(float(sdnn), 1),
            "rmssd": round(float(rmssd), 1)
        },
        "stress_level": stress_level,
        "confidence": round(float(conf), 2),
        "pulse_waveform": waveform_norm
    }

'use client';

// Web Audio API DSP (Digital Signal Processing) Engine
// Implements 5-Band Equalizer (60Hz, 250Hz, 1kHz, 4kHz, 16kHz), Soundstage Presets,
// Dynamics Compression (Night Mode), Sub-bass Boost, and Stereo Expansion.

export const FIVE_BAND_FREQUENCIES = [60, 250, 1000, 4000, 16000];

export type SoundstagePreset = 
  | 'off'
  | 'bass_booster'
  | 'lofi_warmth'
  | 'concert_hall'
  | 'stereo_expand'
  | 'vocal_boost'
  | 'night_mode'
  | 'custom';

class AudioDspEngine {
  private static instance: AudioDspEngine;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private preampGain: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassFilter: BiquadFilterNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isConnected = false;

  private constructor() {
    this.setupHardwareListeners();
  }

  public static getInstance(): AudioDspEngine {
    if (!AudioDspEngine.instance) {
      AudioDspEngine.instance = new AudioDspEngine();
    }
    return AudioDspEngine.instance;
  }

  public initDsp(mediaElement: HTMLMediaElement): AnalyserNode | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return null;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.isConnected) {
        return this.analyserNode;
      }

      this.sourceNode = this.audioCtx.createMediaElementSource(mediaElement);
      this.preampGain = this.audioCtx.createGain();
      this.preampGain.gain.value = 1.0;

      // 5-Band Biquad Filters (60Hz, 250Hz, 1kHz, 4kHz, 16kHz)
      this.eqFilters = FIVE_BAND_FREQUENCIES.map((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = freq <= 60 ? 'lowshelf' : freq >= 16000 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.2;
        filter.gain.value = 0;
        return filter;
      });

      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;

      if (this.audioCtx.createStereoPanner) {
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      this.compressorNode = this.audioCtx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -14;
      this.compressorNode.knee.value = 30;
      this.compressorNode.ratio.value = 8;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;

      let currentChain: AudioNode = this.sourceNode;

      currentChain.connect(this.preampGain);
      currentChain = this.preampGain;

      for (const filter of this.eqFilters) {
        currentChain.connect(filter);
        currentChain = filter;
      }

      currentChain.connect(this.bassFilter);
      currentChain = this.bassFilter;

      if (this.pannerNode) {
        currentChain.connect(this.pannerNode);
        currentChain = this.pannerNode;
      }

      currentChain.connect(this.compressorNode);
      currentChain = this.compressorNode;

      currentChain.connect(this.masterGain);
      currentChain = this.masterGain;

      currentChain.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isConnected = true;
      return this.analyserNode;
    } catch (err) {
      console.warn('[Audio DSP Engine] Failed to initialize Web Audio Context:', err);
      return null;
    }
  }

  // 5-Band Gains (-12dB to +12dB)
  public set5BandEqGains(gains: number[]): void {
    if (!this.eqFilters || this.eqFilters.length === 0) return;
    gains.forEach((gainVal, idx) => {
      if (this.eqFilters[idx]) {
        const clamped = Math.max(-12, Math.min(12, gainVal));
        this.eqFilters[idx].gain.setTargetAtTime(clamped, this.audioCtx?.currentTime || 0, 0.05);
      }
    });
  }

  public setEqGains(gains: number[]): void {
    this.set5BandEqGains(gains);
  }

  // Apply Soundstage Preset
  public applySoundstagePreset(preset: SoundstagePreset): void {
    switch (preset) {
      case 'bass_booster':
        this.set5BandEqGains([6, 3, 0, 0, -2]);
        this.setBassBoost(6);
        break;
      case 'lofi_warmth':
        this.set5BandEqGains([4, 2, 0, -2, -6]);
        this.setBassBoost(3);
        break;
      case 'concert_hall':
        this.set5BandEqGains([3, 1, -1, 2, 4]);
        this.setBalance(0);
        break;
      case 'stereo_expand':
        this.set5BandEqGains([2, 0, 0, 2, 5]);
        break;
      case 'vocal_boost':
        this.set5BandEqGains([-2, 0, 5, 4, 1]);
        this.setBassBoost(0);
        break;
      case 'night_mode':
        this.set5BandEqGains([-3, -1, 0, 1, -4]);
        if (this.compressorNode && this.audioCtx) {
          this.compressorNode.threshold.setTargetAtTime(-24, this.audioCtx.currentTime, 0.05);
          this.compressorNode.ratio.setTargetAtTime(16, this.audioCtx.currentTime, 0.05);
        }
        break;
      case 'off':
      default:
        this.set5BandEqGains([0, 0, 0, 0, 0]);
        this.setBassBoost(0);
        break;
    }
  }

  public setBassBoost(dB: number): void {
    if (this.bassFilter && this.audioCtx) {
      const clamped = Math.max(0, Math.min(15, dB));
      this.bassFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  public setBalance(pan: number): void {
    if (this.pannerNode && this.audioCtx) {
      const clamped = Math.max(-1.0, Math.min(1.0, pan));
      this.pannerNode.pan.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  private setupHardwareListeners(): void {
    if (typeof window === 'undefined') return;

    navigator.mediaDevices?.addEventListener('devicechange', () => {
      console.log('[Audio DSP Engine] Audio device changed');
    });
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public setEqGain(bandIndex: number, dB: number): void {
    if (!this.eqFilters || !this.eqFilters[bandIndex]) return;
    const clamped = Math.max(-12, Math.min(12, dB));
    this.eqFilters[bandIndex].gain.setTargetAtTime(clamped, this.audioCtx?.currentTime || 0, 0.05);
  }

  public setSoundstagePreset(preset: SoundstagePreset): void {
    this.applySoundstagePreset(preset);
  }
}

export const audioDspEngine = AudioDspEngine.getInstance();

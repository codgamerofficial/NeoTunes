'use client';

// Web Audio API DSP (Digital Signal Processing) Engine
// Implements 10-Band Hardware Biquad Equalizer, Dynamics Compression (Loudness Normalization),
// Bass Boost Lowshelf Filter, Anti-Clipping Limiter, Stereo Panner, and Preamp Gain.

const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

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

  // Initialize Web Audio DSP Node Graph
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

      // 1. Source Node from HTML5 Audio / Video element
      this.sourceNode = this.audioCtx.createMediaElementSource(mediaElement);

      // 2. Preamp Gain Node (Pre-amplification)
      this.preampGain = this.audioCtx.createGain();
      this.preampGain.gain.value = 1.0;

      // 3. 10-Band Biquad Filter Array
      this.eqFilters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = freq <= 170 ? 'lowshelf' : freq >= 14000 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        return filter;
      });

      // 4. Bass Boost Lowshelf Filter (80Hz Sub-bass boost)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;

      // 5. Stereo Panner Node (Left / Right Balance)
      if (this.audioCtx.createStereoPanner) {
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.pannerNode.pan.value = 0; // Center
      }

      // 6. Dynamic Range Compressor / Anti-Clipping Limiter (Volume Normalization & Loudness)
      this.compressorNode = this.audioCtx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -12; // dB
      this.compressorNode.knee.value = 30; // dB
      this.compressorNode.ratio.value = 12;
      this.compressorNode.attack.value = 0.003; // seconds
      this.compressorNode.release.value = 0.25; // seconds

      // 7. Master Gain Node
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      // 8. FFT Analyser Node for Visualizers
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Connect DSP Node Chain in Series:
      // Source -> Preamp -> 10 EQ Filters -> Bass Boost -> Stereo Panner -> Compressor/Limiter -> MasterGain -> Analyser -> Output
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

  // Update 10-Band Gains in Real-Time
  public setEqGains(gains: number[]): void {
    if (!this.eqFilters || this.eqFilters.length === 0) return;
    gains.forEach((gainVal, idx) => {
      if (this.eqFilters[idx]) {
        // Clamp gainVal between -12dB and +12dB
        const clamped = Math.max(-12, Math.min(12, gainVal));
        this.eqFilters[idx].gain.setTargetAtTime(clamped, this.audioCtx?.currentTime || 0, 0.05);
      }
    });
  }

  // Set Sub-Bass Boost in dB
  public setBassBoost(dB: number): void {
    if (this.bassFilter && this.audioCtx) {
      const clamped = Math.max(0, Math.min(15, dB));
      this.bassFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  // Set Preamp Gain (0.5x to 2.0x volume multiplier)
  public setPreampGain(gainMultiplier: number): void {
    if (this.preampGain && this.audioCtx) {
      const clamped = Math.max(0, Math.min(2.0, gainMultiplier));
      this.preampGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  // Set Stereo Balance (-1.0 Left to +1.0 Right)
  public setBalance(pan: number): void {
    if (this.pannerNode && this.audioCtx) {
      const clamped = Math.max(-1.0, Math.min(1.0, pan));
      this.pannerNode.pan.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  // Hardware Events: Audio Unplug / Headphone disconnect
  private setupHardwareListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('pagehide', () => {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this.audioCtx.suspend();
      }
    });

    // Detect Headphone Unplug or Audio Output Change
    navigator.mediaDevices?.addEventListener('devicechange', () => {
      console.log('[Audio DSP Engine] Hardware audio output device changed (Headphones plugged/unplugged)');
    });
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }
}

export const audioDspEngine = AudioDspEngine.getInstance();

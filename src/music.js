/**
 * music.js
 * ─────────────────────────────────────────────────────────────
 * Background music system using Web Audio API.
 * Generates a sweet, romantic chiptune melody that loops.
 * Persists on/off state to localStorage.
 * ─────────────────────────────────────────────────────────────
 */

"use strict";

const Music = (() => {

  const STORAGE_KEY = "pixelLoveGame_musicEnabled";
  
  let audioContext;
  let masterGain;
  let isPlaying = false;
  let currentLoop = null;

  // ── Melody data ──────────────────────────────────────────
  // Each note: [frequency_hz, duration_beats, gain]
  // Sweet romantic melody in C major, 120 BPM
  const BEAT = 0.5; // seconds per beat (120 BPM)
  
  const MELODY = [
    // Bar 1
    [523.25, 1,   0.3],  // C5
    [659.25, 0.5, 0.25], // E5
    [587.33, 0.5, 0.25], // D5
    [523.25, 1,   0.3],  // C5
    // Bar 2
    [587.33, 1,   0.3],  // D5
    [659.25, 0.5, 0.25], // E5
    [698.46, 0.5, 0.25], // F5
    [659.25, 1,   0.3],  // E5
    // Bar 3
    [784.00, 1,   0.3],  // G5
    [659.25, 0.5, 0.25], // E5
    [523.25, 0.5, 0.25], // C5
    [587.33, 1,   0.3],  // D5
    // Bar 4
    [523.25, 2,   0.35], // C5 (long)
    [0,      1,   0],    // rest
    [0,      1,   0],    // rest
  ];

  const BASS = [
    // Simple bass line (octave lower)
    [261.63, 2, 0.2],   // C4
    [293.66, 2, 0.2],   // D4
    [329.63, 2, 0.2],   // E4
    [261.63, 2, 0.2],   // C4
  ];

  // ── Audio setup ──────────────────────────────────────────

  function init() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain   = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.15; // Keep it subtle
    }
  }

  // ── Play / Stop ──────────────────────────────────────────

  function play() {
    if (isPlaying) return;
    init();
    
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    isPlaying = true;
    _scheduleLoop();
  }

  function stop() {
    isPlaying = false;
    if (currentLoop) {
      clearTimeout(currentLoop);
      currentLoop = null;
    }
  }

  function toggle() {
    if (isPlaying) {
      stop();
      _saveState(false);
      return false;
    } else {
      play();
      _saveState(true);
      return true;
    }
  }

  function isEnabled() {
    return isPlaying;
  }

  // ── Playback engine ──────────────────────────────────────

  function _scheduleLoop() {
    if (!isPlaying) return;

    const startTime = audioContext.currentTime;
    let time = startTime;

    // Schedule melody
    MELODY.forEach(([freq, dur, gain]) => {
      if (freq > 0) _playNote(freq, time, dur * BEAT, gain, 'square');
      time += dur * BEAT;
    });

    // Schedule bass (runs in parallel, offset slightly)
    let bassTime = startTime + 0.1;
    BASS.forEach(([freq, dur, gain]) => {
      if (freq > 0) _playNote(freq, bassTime, dur * BEAT, gain, 'triangle');
      bassTime += dur * BEAT;
    });

    // Loop length = max of melody/bass
    const loopDuration = Math.max(
      MELODY.reduce((sum, [, dur]) => sum + dur, 0),
      BASS.reduce((sum, [, dur]) => sum + dur, 0)
    ) * BEAT;

    // Schedule next loop
    currentLoop = setTimeout(() => _scheduleLoop(), loopDuration * 1000);
  }

  function _playNote(frequency, startTime, duration, gain, waveType = 'square') {
    const osc  = audioContext.createOscillator();
    const amp  = audioContext.createGain();
    
    osc.type      = waveType;
    osc.frequency.setValueAtTime(frequency, startTime);
    
    // ADSR envelope for chiptune feel
    amp.gain.setValueAtTime(0, startTime);
    amp.gain.linearRampToValueAtTime(gain, startTime + 0.01);        // attack
    amp.gain.linearRampToValueAtTime(gain * 0.7, startTime + 0.05);  // decay
    amp.gain.setValueAtTime(gain * 0.7, startTime + duration - 0.05);// sustain
    amp.gain.linearRampToValueAtTime(0, startTime + duration);       // release
    
    osc.connect(amp);
    amp.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ── Persistence ──────────────────────────────────────────

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === null ? true : saved === "true"; // default: ON
    } catch {
      return true;
    }
  }

  function _saveState(enabled) {
    try {
      localStorage.setItem(STORAGE_KEY, enabled.toString());
    } catch {
      // Ignore
    }
  }

  // ── Public API ───────────────────────────────────────────
  return { init, play, stop, toggle, isEnabled, loadState };

})();

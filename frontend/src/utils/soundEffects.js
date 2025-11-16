/**
 * Sound Effects Utility
 * Professional, minimal sound effects using Web Audio API
 */

// Create audio context (singleton pattern)
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a cheerful, positive completion sound
 * An uplifting major chord progression with a celebratory feel
 */
export const playTaskCompleteSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (required by some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Create a cheerful, uplifting major chord progression (C-E-G-C, then C-F-A-C)
    // More interactive with layered notes and a celebratory ending
    const chord1 = [
      { freq: 523.25, time: 0.0, duration: 0.25 }, // C5
      { freq: 659.25, time: 0.05, duration: 0.25 }, // E5
      { freq: 783.99, time: 0.1, duration: 0.25 }, // G5
    ];
    
    const chord2 = [
      { freq: 523.25, time: 0.2, duration: 0.3 }, // C5 (octave jump)
      { freq: 698.46, time: 0.25, duration: 0.3 }, // F5
      { freq: 880.00, time: 0.3, duration: 0.3 }, // A5
    ];
    
    // Final celebratory high note
    const finale = { freq: 1046.50, time: 0.4, duration: 0.2 }; // C6
    
    [...chord1, ...chord2, finale].forEach(({ freq, time: startTime, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Use 'sine' for smoother, more pleasant sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + startTime);
      
      // More dynamic volume with pleasant fade
      gainNode.gain.setValueAtTime(0, now + startTime);
      gainNode.gain.linearRampToValueAtTime(0.12, now + startTime + 0.03);
      gainNode.gain.linearRampToValueAtTime(0.08, now + startTime + duration * 0.6);
      gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration);
      
      oscillator.start(now + startTime);
      oscillator.stop(now + startTime + duration);
    });
  } catch (error) {
    // Silently fail if audio is not supported
    console.debug('Audio not supported or failed:', error);
  }
};

/**
 * Play a positive, engaging sound when adding a task
 * A friendly two-note ascending melody that feels encouraging
 */
export const playTaskAddSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Create a cheerful two-note ascending melody (C -> E, major third)
    // More interactive and positive feeling
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.15 }, // C5
      { freq: 659.25, time: 0.12, duration: 0.18 }, // E5 (slightly overlapping for smoothness)
    ];
    
    notes.forEach(({ freq, time: startTime, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Use 'sine' for a clean, pleasant tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + startTime);
      
      // Smooth, pleasant volume envelope
      gainNode.gain.setValueAtTime(0, now + startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, now + startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.07, now + startTime + duration * 0.7);
      gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration);
      
      oscillator.start(now + startTime);
      oscillator.stop(now + startTime + duration);
    });
  } catch (error) {
    // Silently fail if audio is not supported
    console.debug('Audio not supported or failed:', error);
  }
};


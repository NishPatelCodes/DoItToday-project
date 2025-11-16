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
 * Play a pleasant completion sound (positive, minimal)
 * A soft ascending chord progression
 */
export const playTaskCompleteSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (required by some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Create a pleasant ascending chord (C major triad -> F major)
    const frequencies = [
      { freq: 523.25, time: 0.0, duration: 0.15 }, // C5
      { freq: 659.25, time: 0.05, duration: 0.15 }, // E5
      { freq: 783.99, time: 0.1, duration: 0.15 }, // G5
      { freq: 698.46, time: 0.15, duration: 0.2 }, // F5
    ];
    
    frequencies.forEach(({ freq, time: startTime, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + startTime);
      
      // Gentle fade in and out
      gainNode.gain.setValueAtTime(0, now + startTime);
      gainNode.gain.linearRampToValueAtTime(0.08, now + startTime + 0.02);
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
 * Play a subtle notification sound when adding a task
 * A simple, pleasant beep
 */
export const playTaskAddSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Pleasant tone (C5)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now);
    
    // Quick, subtle sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.12);
    
    oscillator.start(now);
    oscillator.stop(now + 0.12);
  } catch (error) {
    // Silently fail if audio is not supported
    console.debug('Audio not supported or failed:', error);
  }
};


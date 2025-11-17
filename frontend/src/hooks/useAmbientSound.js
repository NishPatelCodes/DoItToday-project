import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Optimized ambient sound hook with better performance and user interaction handling
 */
const SOUND_URLS = {
  silent: null,
  rain: null,
  ocean: null,
  forest: null,
  coffee: null,
  whiteNoise: null,
  brownNoise: null,
};

// Optimized noise generation - smaller buffer, more efficient
const generateNoise = (type = 'white', audioContext) => {
  // Use smaller buffer for better performance (1 second, looped)
  const bufferSize = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'brown') {
    let lastValue = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.5;
      lastValue = lastValue * 0.98 + white * 0.02;
      data[i] = lastValue;
    }
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
};

export const useAmbientSound = (initialSound = 'silent', initialVolume = 0.5) => {
  const [currentSound, setCurrentSound] = useState(() => {
    try {
      const saved = localStorage.getItem('ambient-sound');
      return saved || initialSound;
    } catch {
      return initialSound;
    }
  });
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('ambient-volume');
      return saved ? parseFloat(saved) : initialVolume;
    } catch {
      return initialVolume;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const noiseRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize audio context on user interaction
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      return audioContextRef.current;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      const context = new AudioContextClass();
      audioContextRef.current = context;
      
      // Resume if suspended (required for some browsers)
      if (context.state === 'suspended') {
        context.resume().catch(() => {
          // Silently handle resume errors
        });
      }

      return context;
    } catch (error) {
      console.error('Error initializing audio context:', error);
      return null;
    }
  }, []);

  // Save settings to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ambient-sound', currentSound);
      } catch (e) {
        // Ignore localStorage errors
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentSound]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ambient-volume', volume.toString());
      } catch (e) {
        // Ignore localStorage errors
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [volume]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      sourceRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (noiseRef.current) {
      noiseRef.current = null;
    }
  }, []);

  // Handle audio playback - optimized
  useEffect(() => {
    if (currentSound === 'silent') {
      cleanup();
      setIsPlaying(false);
      return;
    }

    // Handle noise generation for white/brown noise
    if (currentSound === 'whiteNoise' || currentSound === 'brownNoise') {
      if (isPlaying) {
        cleanup(); // Clean up previous source
        
        const context = initializeAudioContext();
        if (!context) {
          setIsPlaying(false);
          return;
        }

        try {
          const noiseType = currentSound === 'whiteNoise' ? 'white' : 'brown';
          const source = generateNoise(noiseType, context);
          const gainNode = context.createGain();
          
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(context.destination);
          
          source.start(0);
          sourceRef.current = source;
          gainNodeRef.current = gainNode;
          noiseRef.current = { source, gainNode };
        } catch (error) {
          console.error('Error generating noise:', error);
          setIsPlaying(false);
        }
      } else {
        cleanup();
      }
      return;
    }

    // Handle regular audio files (if URLs are provided)
    if (SOUND_URLS[currentSound]) {
      if (!audioRef.current) {
        const audio = new Audio(SOUND_URLS[currentSound]);
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;
      }

      if (audioRef.current) {
        audioRef.current.volume = volume;
        
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            });
          }
        } else {
          audioRef.current.pause();
        }
      }
      return;
    }

    // Fallback to noise generation for ambient sounds without URLs
    if (currentSound !== 'silent' && !SOUND_URLS[currentSound]) {
      if (isPlaying) {
        cleanup();
        
        const context = initializeAudioContext();
        if (!context) {
          setIsPlaying(false);
          return;
        }

        try {
          const noiseType = currentSound === 'rain' || currentSound === 'ocean' ? 'brown' : 'white';
          const source = generateNoise(noiseType, context);
          const gainNode = context.createGain();
          
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(context.destination);
          
          source.start(0);
          sourceRef.current = source;
          gainNodeRef.current = gainNode;
          noiseRef.current = { source, gainNode };
        } catch (error) {
          console.error('Error generating noise:', error);
          setIsPlaying(false);
        }
      } else {
        cleanup();
      }
    }

    return cleanup;
  }, [currentSound, volume, isPlaying, initializeAudioContext, cleanup]);

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    // Initialize audio context on first play (user interaction)
    if (!isInitializedRef.current) {
      initializeAudioContext();
      isInitializedRef.current = true;
    }
    setIsPlaying(true);
  }, [initializeAudioContext]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);

  const fadeIn = useCallback((duration = 2000) => {
    if (gainNodeRef.current) {
      const now = gainNodeRef.current.context.currentTime;
      gainNodeRef.current.gain.setValueAtTime(0, now);
      gainNodeRef.current.gain.linearRampToValueAtTime(volume, now + duration / 1000);
    } else if (audioRef.current) {
      audioRef.current.volume = 0;
      const interval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume < volume) {
          audioRef.current.volume = Math.min(audioRef.current.volume + 0.05, volume);
        } else {
          clearInterval(interval);
        }
      }, 50);
    }
  }, [volume]);

  const fadeOut = useCallback((duration = 2000) => {
    if (gainNodeRef.current) {
      const now = gainNodeRef.current.context.currentTime;
      gainNodeRef.current.gain.linearRampToValueAtTime(0, now + duration / 1000);
    } else if (audioRef.current) {
      const startVolume = audioRef.current.volume;
      const interval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0) {
          audioRef.current.volume = Math.max(audioRef.current.volume - 0.05, 0);
        } else {
          clearInterval(interval);
          stop();
        }
      }, 50);
    }
  }, [stop]);

  return {
    currentSound,
    volume,
    isPlaying,
    setCurrentSound,
    setVolume,
    play,
    stop,
    fadeIn,
    fadeOut,
  };
};

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for ambient sound playback
 * Supports multiple sound types with volume control and fade effects
 */
// Ambient sound URLs - using free audio sources
// Note: In production, replace with your own hosted audio files or use a service like freesound.org
const SOUND_URLS = {
  silent: null,
  // Using placeholder URLs - replace with actual hosted audio files
  // For production, consider hosting your own audio files or using a CDN
  rain: null, // Will use Web Audio API noise generation as fallback
  ocean: null,
  forest: null,
  coffee: null,
  whiteNoise: null, // Uses Web Audio API
  brownNoise: null, // Uses Web Audio API
};

// Generate brown/white noise using Web Audio API as fallback
const generateNoise = (type = 'white', duration = 3600) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    if (type === 'white') {
      data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      // Brown noise (random walk)
      data[i] = (Math.random() * 2 - 1) * 0.5;
      if (i > 0) {
        data[i] = data[i - 1] * 0.99 + data[i] * 0.01;
      }
    }
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return { source, audioContext };
};

export const useAmbientSound = (initialSound = 'silent', initialVolume = 0.5) => {
  const [currentSound, setCurrentSound] = useState(() => {
    const saved = localStorage.getItem('ambient-sound');
    return saved || initialSound;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('ambient-volume');
    return saved ? parseFloat(saved) : initialVolume;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const noiseRef = useRef(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('ambient-sound', currentSound);
  }, [currentSound]);

  useEffect(() => {
    localStorage.setItem('ambient-volume', volume.toString());
  }, [volume]);

  // Handle audio playback
  useEffect(() => {
    if (currentSound === 'silent') {
      stop();
      return;
    }

    // Handle noise generation for white/brown noise
    if (currentSound === 'whiteNoise' || currentSound === 'brownNoise') {
      if (isPlaying) {
        try {
          const noiseType = currentSound === 'whiteNoise' ? 'white' : 'brown';
          const { source, audioContext } = generateNoise(noiseType);
          const gainNode = audioContext.createGain();
          
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          source.start(0);
          noiseRef.current = { source, audioContext, gainNode };
        } catch (error) {
          console.error('Error generating noise:', error);
        }
      } else {
        if (noiseRef.current) {
          try {
            noiseRef.current.source.stop();
            noiseRef.current.audioContext.close();
          } catch (error) {
            // Ignore errors when stopping
          }
          noiseRef.current = null;
        }
      }
      return;
    }

    // Handle regular audio files (if URLs are provided)
    if (SOUND_URLS[currentSound] && !audioRef.current) {
      const audio = new Audio(SOUND_URLS[currentSound]);
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
    }

    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    } else if (currentSound !== 'silent' && currentSound !== 'whiteNoise' && currentSound !== 'brownNoise' && !SOUND_URLS[currentSound]) {
      // If no URL is provided, fall back to noise generation for ambient sounds
      if (isPlaying) {
        try {
          const noiseType = currentSound === 'rain' || currentSound === 'ocean' ? 'brown' : 'white';
          const { source, audioContext } = generateNoise(noiseType);
          const gainNode = audioContext.createGain();
          
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          source.start(0);
          noiseRef.current = { source, audioContext, gainNode };
        } catch (error) {
          console.error('Error generating noise:', error);
        }
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSound, volume, isPlaying]);

  const play = () => {
    setIsPlaying(true);
  };

  const stop = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (noiseRef.current) {
      try {
        noiseRef.current.source.stop();
        noiseRef.current.audioContext.close();
      } catch (error) {
        // Ignore errors
      }
      noiseRef.current = null;
    }
  };

  const fadeIn = (duration = 2000) => {
    if (audioRef.current || noiseRef.current) {
      const gainNode = noiseRef.current?.gainNode;
      const audio = audioRef.current;
      
      if (gainNode) {
        gainNode.gain.setValueAtTime(0, gainNode.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, gainNode.context.currentTime + duration / 1000);
      } else if (audio) {
        audio.volume = 0;
        const interval = setInterval(() => {
          if (audio.volume < volume) {
            audio.volume = Math.min(audio.volume + 0.1, volume);
          } else {
            clearInterval(interval);
          }
        }, duration / 20);
      }
    }
  };

  const fadeOut = (duration = 2000) => {
    if (audioRef.current || noiseRef.current) {
      const gainNode = noiseRef.current?.gainNode;
      const audio = audioRef.current;
      
      if (gainNode) {
        gainNode.gain.linearRampToValueAtTime(0, gainNode.context.currentTime + duration / 1000);
      } else if (audio) {
        const startVolume = audio.volume;
        const interval = setInterval(() => {
          if (audio.volume > 0) {
            audio.volume = Math.max(audio.volume - 0.1, 0);
          } else {
            clearInterval(interval);
            stop();
          }
        }, duration / 20);
      }
    }
  };

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


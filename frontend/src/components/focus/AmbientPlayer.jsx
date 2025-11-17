import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';

/**
 * Optimized Ambient Sound Player Component
 */
const SOUND_OPTIONS = [
  { id: 'silent', label: 'Silent', icon: '🔇', description: 'No background sound' },
  { id: 'rain', label: 'Rain', icon: '🌧️', description: 'Gentle rain sounds' },
  { id: 'ocean', label: 'Ocean', icon: '🌊', description: 'Ocean waves' },
  { id: 'forest', label: 'Forest', icon: '🌲', description: 'Forest ambience' },
  { id: 'coffee', label: 'Coffee Shop', icon: '☕', description: 'Cafe atmosphere' },
  { id: 'whiteNoise', label: 'White Noise', icon: '📻', description: 'White noise' },
  { id: 'brownNoise', label: 'Brown Noise', icon: '📻', description: 'Brown noise' },
];

const AmbientPlayer = memo(({
  currentSound,
  volume,
  isPlaying,
  onSoundChange,
  onVolumeChange,
  onPlay,
  onStop,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSoundOption = SOUND_OPTIONS.find(s => s.id === currentSound) || SOUND_OPTIONS[0];

  const handlePlayToggle = useCallback((e) => {
    e.stopPropagation();
    if (isPlaying) {
      onStop();
    } else {
      // Ensure audio context is initialized on user interaction
      onPlay();
    }
  }, [isPlaying, onPlay, onStop]);

  const handleSoundSelect = useCallback((soundId) => {
    onSoundChange(soundId);
    if (soundId !== 'silent') {
      // Initialize and play on user interaction
      onPlay();
    } else {
      onStop();
    }
  }, [onSoundChange, onPlay, onStop]);

  return (
    <div className={`relative ${className}`}>
      {/* Compact view */}
      <motion.div
        className="card p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{currentSoundOption.icon}</div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">{currentSoundOption.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{currentSoundOption.description}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentSound !== 'silent' && (
              <button
                onClick={handlePlayToggle}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors active:scale-95"
                aria-label={isPlaying ? 'Stop sound' : 'Play sound'}
                type="button"
              >
                {isPlaying ? (
                  <FaVolumeUp className="text-[var(--accent-primary)]" />
                ) : (
                  <FaVolumeMute className="text-[var(--text-tertiary)]" />
                )}
              </button>
            )}
            <FaMusic className="text-[var(--text-tertiary)]" />
          </div>
        </div>

        {/* Volume slider (visible when playing) */}
        {isPlaying && currentSound !== 'silent' && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <FaVolumeMute className="text-xs text-[var(--text-tertiary)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
                aria-label="Volume"
              />
              <FaVolumeUp className="text-xs text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-secondary)] w-10 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 card p-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Select Ambient Sound
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SOUND_OPTIONS.map((sound) => (
                <motion.button
                  key={sound.id}
                  onClick={() => {
                    handleSoundSelect(sound.id);
                    setIsExpanded(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    currentSound === sound.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                  }`}
                  type="button"
                >
                  <div className="text-xl mb-1">{sound.icon}</div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">{sound.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AmbientPlayer.displayName = 'AmbientPlayer';

export default AmbientPlayer;

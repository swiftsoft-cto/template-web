import React from 'react';
import { Box, Slider, Stack, Typography, IconButton } from '@mui/material';
import { PlayCircleOutlined, PauseCircleOutlined, StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';

function formatPlayerTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface PlayerControlsProps {
  currentTime: number;
  duration: number;
  playing: boolean;
  mediaReady: boolean;
  mediaLoading: boolean;
  mediaBlobUrl: string | null;
  useVideo: boolean;
  mediaRef: React.RefObject<HTMLAudioElement | HTMLVideoElement | null>;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSliderChange: (_: unknown, value: number | number[]) => void;
  onSliderChangeCommitted: (_: unknown, value: number | number[]) => void;
  onMediaPlay: () => void;
  onMediaPause: () => void;
  onMediaTimeUpdate: () => void;
  onMediaLoadedMetadata: () => void;
  onMediaSeeked: () => void;
  onMediaError: () => void;
}

const PlayerControls = React.memo(function PlayerControls({
  currentTime,
  duration,
  playing,
  mediaReady,
  mediaLoading,
  mediaBlobUrl,
  useVideo,
  mediaRef,
  onPlayPause,
  onStepBack,
  onStepForward,
  onSliderChange,
  onSliderChangeCommitted,
  onMediaPlay,
  onMediaPause,
  onMediaTimeUpdate,
  onMediaLoadedMetadata,
  onMediaSeeked,
  onMediaError
}: PlayerControlsProps) {
  return (
    <Box sx={{ px: 2, pb: 2, pt: 1, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
      {mediaLoading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Carregando mídia…
        </Typography>
      )}
      {mediaBlobUrl &&
        (useVideo ? (
          <video
            ref={(el) => {
              (mediaRef as React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>).current = el;
            }}
            src={mediaBlobUrl}
            style={{ display: 'none' }}
            onPlay={onMediaPlay}
            onPause={onMediaPause}
            onTimeUpdate={onMediaTimeUpdate}
            onLoadedMetadata={onMediaLoadedMetadata}
            onSeeked={onMediaSeeked}
            onError={onMediaError}
            playsInline
            preload="metadata"
          />
        ) : (
          <audio
            ref={(el) => {
              (mediaRef as React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>).current = el;
            }}
            src={mediaBlobUrl}
            onPlay={onMediaPlay}
            onPause={onMediaPause}
            onTimeUpdate={onMediaTimeUpdate}
            onLoadedMetadata={onMediaLoadedMetadata}
            onSeeked={onMediaSeeked}
            onError={onMediaError}
            preload="metadata"
            style={{ display: 'none' }}
          />
        ))}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {formatPlayerTime(currentTime)}
        </Typography>
        <Slider
          size="small"
          min={0}
          max={Math.max(1, duration)}
          step={duration > 10 ? 10 : 1}
          value={currentTime}
          onChange={onSliderChange}
          onChangeCommitted={onSliderChangeCommitted}
          disabled={!mediaReady || mediaLoading}
          valueLabelDisplay="off"
          valueLabelFormat={(v) => formatPlayerTime(v)}
          sx={{ flex: 1, touchAction: 'none' }}
        />
        <Typography variant="caption" color="text.secondary">
          {formatPlayerTime(duration)}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={onPlayPause} disabled={!mediaBlobUrl || mediaLoading}>
          {playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        </IconButton>
        <IconButton size="small" onClick={onStepBack} disabled={!mediaReady || mediaLoading}>
          <StepBackwardOutlined />
        </IconButton>
        <IconButton size="small" onClick={onStepForward} disabled={!mediaReady || mediaLoading}>
          <StepForwardOutlined />
        </IconButton>
      </Stack>
    </Box>
  );
});

export default PlayerControls;

import React from 'react';
import { Box, Typography, TextField, Button, Stack, IconButton, Tooltip, Badge } from '@mui/material';
import { CheckOutlined, CloseOutlined, CommentOutlined } from '@ant-design/icons';
import type { TranscriptionSegment } from '../../../types/transcriptions';
import { usePermission } from '../../../hooks/usePermission';

interface TranscriptionSegmentRowProps {
  seg: TranscriptionSegment;
  isEditing: boolean;
  diarizationEnabled: boolean;
  segmentCommentCount: number;
  savingSegment: boolean;
  onEdit: (seg: TranscriptionSegment) => void;
  onSave: (segmentId: string, text: string, speaker: string) => void;
  onCancel: () => void;
  onOpenComments: (segmentId: string) => void;
  onTimestampClick?: (seg: TranscriptionSegment) => void;
}

const TranscriptionSegmentRow = React.memo(function TranscriptionSegmentRow({
  seg,
  isEditing,
  diarizationEnabled,
  segmentCommentCount,
  savingSegment,
  onEdit,
  onSave,
  onCancel,
  onOpenComments,
  onTimestampClick
}: TranscriptionSegmentRowProps) {
  const canEdit = usePermission('transcriptions.update');
  const canComment = usePermission(['transcriptions.comments.read', 'transcriptions.comments.create']);

  // Mantém o draft local para NÃO re-renderizar a página inteira a cada tecla digitada
  const [draftText, setDraftText] = React.useState(seg.text);
  const [draftSpeaker, setDraftSpeaker] = React.useState(seg.speaker || '');

  React.useEffect(() => {
    if (!isEditing) return;
    setDraftText(seg.text);
    setDraftSpeaker(seg.speaker || '');
  }, [isEditing, seg.text, seg.speaker]);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        id={`segment-${seg.id}`}
        data-active="0"
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          py: 0.5,
          px: 1,
          bgcolor: 'transparent',
          ml: -0.5,
          pl: 1.5,
          borderLeft: '3px solid transparent',
          borderRadius: 1,
          position: 'relative',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'action.hover' },
          '&[data-active="1"]': {
            bgcolor: 'rgba(25, 118, 210, 0.12)',
            borderLeftColor: 'primary.main'
          },
          '&[data-active="1"]:hover': { bgcolor: 'rgba(25, 118, 210, 0.18)' }
        }}
      >
        {onTimestampClick ? (
          <Tooltip title="Clique para reproduzir a partir daqui">
            <Typography
              variant="caption"
              color="text.secondary"
              component="span"
              sx={{
                flexShrink: 0,
                fontFamily: 'monospace',
                pt: 0.5,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' }
              }}
              onClick={() => onTimestampClick(seg)}
            >
              {seg.startTime}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontFamily: 'monospace', pt: 0.5 }}>
            {seg.startTime}
          </Typography>
        )}

        {diarizationEnabled &&
          (isEditing && canEdit ? (
            <TextField
              size="small"
              value={draftSpeaker}
              onChange={(e) => setDraftSpeaker(e.target.value)}
              sx={{ width: 60, flexShrink: 0, '& input': { fontSize: '0.75rem', fontWeight: 600, color: 'primary.main' } }}
              disabled={savingSegment}
            />
          ) : canEdit ? (
            <Tooltip title="Clique para editar">
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight={600}
                component="span"
                sx={{ flexShrink: 0, cursor: 'pointer', pt: 0.5 }}
                onClick={() => onEdit(seg)}
              >
                {seg.speaker}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ flexShrink: 0, pt: 0.5 }}>
              {seg.speaker}
            </Typography>
          ))}

        {isEditing && canEdit ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <TextField
              fullWidth
              multiline
              size="small"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              disabled={savingSegment}
              autoFocus
              sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
            />
            <Stack direction="row" spacing={0.5}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckOutlined />}
                onClick={() => onSave(seg.id, draftText, draftSpeaker)}
                disabled={savingSegment}
              >
                {savingSegment ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button size="small" variant="outlined" startIcon={<CloseOutlined />} onClick={onCancel} disabled={savingSegment}>
                Cancelar
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {canEdit ? (
              <Tooltip title="Clique para editar">
                <Typography variant="body2" component="span" sx={{ flex: 1, cursor: 'pointer' }} onClick={() => onEdit(seg)}>
                  {seg.text}
                </Typography>
              </Tooltip>
            ) : (
              <Typography variant="body2" component="span" sx={{ flex: 1 }}>
                {seg.text}
              </Typography>
            )}
            {canComment && (
              <Tooltip title={segmentCommentCount > 0 ? `${segmentCommentCount} comentário(s)` : 'Adicionar comentário'}>
                <IconButton size="small" onClick={() => onOpenComments(seg.id)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                  <Badge badgeContent={segmentCommentCount} color="primary" max={99}>
                    <CommentOutlined style={{ fontSize: '16px' }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default TranscriptionSegmentRow;

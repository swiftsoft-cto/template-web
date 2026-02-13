import { useEffect, useMemo, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import AudioOutlined from '@ant-design/icons/AudioOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

import { openSnackbar } from '../../api/snackbar';
import { Mp3Encoder } from 'lamejs';

type Props = {
  open: boolean;
  onClose: () => void;
};

type Status = 'idle' | 'preparing' | 'recording' | 'stopping' | 'done' | 'error';

function pickMimeType() {
  // Prioriza formatos com melhor qualidade de áudio
  const candidates = [
    'audio/webm;codecs=opus', // Opus com alta qualidade
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4', // AAC (se disponível)
    'audio/mpeg' // MP3 (se disponível)
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return '';
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Converte blob WebM/Opus para MP3 usando decodeAudioData + lamejs */
async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const ctx = new AudioContext();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();

  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const kbps = 128;

  const mp3encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const left = audioBuffer.getChannelData(0);
  const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

  const sampleBlockSize = 1152;
  const mp3Data: Int8Array[] = [];

  for (let i = 0; i < left.length; i += sampleBlockSize) {
    const leftChunk = left.subarray(i, i + sampleBlockSize);
    const rightChunk = right.subarray(i, i + sampleBlockSize);
    const leftInt16 = floatTo16BitPCM(leftChunk);
    const rightInt16 = floatTo16BitPCM(rightChunk);
    const mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) mp3Data.push(mp3buf);

  const totalLength = mp3Data.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of mp3Data) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return new Blob([result], { type: 'audio/mpeg' });
}

function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export default function TabMicRecorderDialog({ open, onClose }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [resultTabUrl, setResultTabUrl] = useState<string | null>(null);
  const [resultTabBlob, setResultTabBlob] = useState<Blob | null>(null);
  const [resultMicUrl, setResultMicUrl] = useState<string | null>(null);
  const [resultMicBlob, setResultMicBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [rawMic, setRawMic] = useState<boolean>(false);

  const displayStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const tabRecorderRef = useRef<MediaRecorder | null>(null);
  const micRecorderRef = useRef<MediaRecorder | null>(null);
  const tabChunksRef = useRef<BlobPart[]>([]);
  const micChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewWindowRef = useRef<Window | null>(null);
  const stopCountRef = useRef(0);

  const supported = useMemo(() => {
    const ok =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getDisplayMedia &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined';
    return ok;
  }, []);

  function stopAllTracks() {
    displayStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    displayStreamRef.current = null;
    micStreamRef.current = null;
  }

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetResult() {
    if (resultTabUrl) URL.revokeObjectURL(resultTabUrl);
    if (resultMicUrl) URL.revokeObjectURL(resultMicUrl);
    setResultTabUrl(null);
    setResultTabBlob(null);
    setResultMicUrl(null);
    setResultMicBlob(null);
  }

  function hardReset() {
    clearTimer();
    stopAllTracks();
    try {
      tabRecorderRef.current?.stop();
      micRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    tabRecorderRef.current = null;
    micRecorderRef.current = null;
    tabChunksRef.current = [];
    micChunksRef.current = [];
    stopCountRef.current = 0;
    setSeconds(0);
  }

  async function handleStart() {
    setError(null);
    resetResult();

    if (!supported) {
      const msg = 'Seu navegador não suporta captura de aba + microfone com MediaRecorder.';
      setStatus('error');
      setError(msg);
      openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
      return;
    }

    try {
      setStatus('preparing');

      const mt = pickMimeType();
      setMimeType(mt);

      /**
       * IMPORTANTE:
       * - O usuário precisa escolher "Aba do Chrome" e marcar "Compartilhar áudio".
       * - Mantemos video:true porque o fluxo do Chrome geralmente exige isso para expor "share tab audio".
       */
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      displayStreamRef.current = displayStream;

      // Mic: às vezes o processamento (AGC/NS/AEC) "some" com sua voz quando há áudio alto tocando.
      // Deixe o switch "Mic sem processamento" ligado se ainda ficar ruim.
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: rawMic
          ? {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
      });
      micStreamRef.current = micStream;

      const tabAudioTrack = displayStream.getAudioTracks()[0];
      if (!tabAudioTrack) {
        const msg = 'A aba selecionada não forneceu áudio. Marque "Compartilhar áudio" ao selecionar a aba.';
        setStatus('error');
        setError(msg);
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
        stopAllTracks();
        return;
      }

      const micTrack = micStream.getAudioTracks()[0];
      if (!micTrack) {
        const msg = 'Não foi possível acessar o microfone. Verifique as permissões.';
        setStatus('error');
        setError(msg);
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
        stopAllTracks();
        return;
      }

      // Verifica se ambos os tracks estão ativos
      if (tabAudioTrack.readyState !== 'live' || micTrack.readyState !== 'live') {
        const msg = 'Um ou ambos os streams de áudio não estão ativos. Tente novamente.';
        setStatus('error');
        setError(msg);
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
        stopAllTracks();
        return;
      }

      const options: any = mt ? { mimeType: mt } : {};
      if (mt.includes('opus')) options.audioBitsPerSecond = 128000;

      const tabStream = new MediaStream([tabAudioTrack]);
      const micStreamForRec = new MediaStream([micTrack]);

      const tabRec = new MediaRecorder(tabStream, options);
      const micRec = new MediaRecorder(micStreamForRec, options);
      tabRecorderRef.current = tabRec;
      micRecorderRef.current = micRec;
      tabChunksRef.current = [];
      micChunksRef.current = [];
      stopCountRef.current = 0;

      const finishOne = async (chunks: BlobPart[], isTab: boolean) => {
        const finalType = (isTab ? tabRec : micRec).mimeType || mt || 'audio/webm';
        const webmBlob = new Blob(chunks, { type: finalType });
        let blob: Blob;
        try {
          blob = await convertWebmToMp3(webmBlob);
        } catch {
          blob = webmBlob;
        }
        const url = URL.createObjectURL(blob);
        if (isTab) {
          setResultTabBlob(blob);
          setResultTabUrl(url);
        } else {
          setResultMicBlob(blob);
          setResultMicUrl(url);
        }
        stopCountRef.current += 1;
        if (stopCountRef.current === 2) {
          clearTimer();
          stopAllTracks();
          setStatus('done');
          previewWindowRef.current = null;
        }
      };

      tabRec.ondataavailable = (e) => {
        if (e.data && e.data.size) tabChunksRef.current.push(e.data);
      };
      tabRec.onstop = () => finishOne(tabChunksRef.current, true);

      micRec.ondataavailable = (e) => {
        if (e.data && e.data.size) micChunksRef.current.push(e.data);
      };
      micRec.onstop = () => finishOne(micChunksRef.current, false);

      const onRecError = () => {
        const msg = 'Falha ao gravar áudio. Tente novamente.';
        setStatus('error');
        setError(msg);
        openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
      };
      tabRec.onerror = onRecError;
      micRec.onerror = onRecError;

      tabAudioTrack.onended = () => {
        if (tabRec.state === 'recording' || micRec.state === 'recording') {
          setError('O áudio da aba foi interrompido.');
          handleStop();
        }
      };
      micTrack.onended = () => {
        if (tabRec.state === 'recording' || micRec.state === 'recording') {
          setError('O microfone foi interrompido.');
          handleStop();
        }
      };

      tabRec.start(50);
      micRec.start(50);
      setStatus('recording');
      setSeconds(0);
      clearTimer();
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Permissão negada. Você precisa permitir microfone e compartilhamento de aba com áudio.'
          : err?.message || 'Não foi possível iniciar a gravação.';
      setStatus('error');
      setError(msg);
      openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
      hardReset();
    }
  }

  function handleStop() {
    if (!tabRecorderRef.current || !micRecorderRef.current) return;
    if (tabRecorderRef.current.state !== 'recording' && micRecorderRef.current.state !== 'recording') return;

    setStatus('stopping');
    previewWindowRef.current = window.open('', '_blank', 'noopener,noreferrer');

    try {
      if (tabRecorderRef.current.state === 'recording') tabRecorderRef.current.stop();
      if (micRecorderRef.current.state === 'recording') micRecorderRef.current.stop();
    } catch (err: any) {
      const msg = err?.message || 'Não foi possível parar a gravação.';
      setStatus('error');
      setError(msg);
      openSnackbar({ open: true, message: msg, variant: 'alert', alert: { color: 'error' } } as any);
      hardReset();
    }
  }

  useEffect(() => {
    if (!open) return;
    // ao abrir, não faz nada
    return () => {
      // cleanup ao fechar/desmontar
      hardReset();
      resetResult();
      setStatus('idle');
      setError(null);
      previewWindowRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canStart = supported && (status === 'idle' || status === 'done' || status === 'error');
  const canStop = status === 'recording';
  const isBusy = status === 'preparing' || status === 'stopping';

  const sizeLabel = (blob: Blob | null) => {
    if (!blob) return '';
    const bytes = blob.size;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isBusy) onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <AudioOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Gravar áudio (aba e microfone separados)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dois arquivos MP3 (Chrome/Edge)
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={() => {
            if (!isBusy) onClose();
          }}
        >
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!supported && (
          <Stack spacing={1}>
            <Typography color="error" fontWeight={600}>
              Não suportado neste navegador.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use Chrome/Edge em HTTPS (ou localhost). O navegador precisa suportar getDisplayMedia + MediaRecorder.
            </Typography>
          </Stack>
        )}

        <Stack spacing={1.25}>
          <Typography variant="body2">Passos:</Typography>
          <Stack spacing={0.5} sx={{ pl: 1 }}>
            <Typography variant="body2" color="text.secondary">
              1) Clique <b>Iniciar</b>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2) Selecione <b>Aba do Chrome</b> (ex.: Google Meet).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3) Marque <b>Compartilhar áudio</b>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4) Autorize o <b>microfone</b>.
            </Typography>
          </Stack>

          <Divider />

          <FormControlLabel
            control={
              <Switch
                checked={rawMic}
                onChange={(e) => setRawMic(e.target.checked)}
                disabled={status === 'recording' || status === 'preparing' || status === 'stopping'}
              />
            }
            label={
              <Stack spacing={0.25}>
                <Typography variant="body2">Mic sem processamento (raw)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Desliga AGC/NoiseSuppression/EchoCancellation do Chrome (pode ajudar quando a aba toca alto).
                </Typography>
              </Stack>
            }
          />

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={
                  status === 'idle'
                    ? 'pronto'
                    : status === 'preparing'
                      ? 'preparando...'
                      : status === 'recording'
                        ? 'gravando'
                        : status === 'stopping'
                          ? 'finalizando...'
                          : status === 'done'
                            ? 'concluído'
                            : 'erro'
                }
                color={status === 'recording' ? 'error' : status === 'done' ? 'success' : status === 'error' ? 'warning' : 'default'}
                variant={status === 'recording' ? 'filled' : 'outlined'}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {fmtTime(seconds)}
              </Typography>
              {mimeType && <Chip size="small" variant="outlined" label={mimeType} />}
            </Stack>
            {isBusy && <CircularProgress size={18} />}
          </Stack>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {(resultTabUrl || resultMicUrl) && (
            <Stack spacing={2}>
              {resultTabUrl && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Áudio da aba
                  </Typography>
                  <audio controls src={resultTabUrl} style={{ width: '100%' }} />
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {sizeLabel(resultTabBlob)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => window.open(resultTabUrl!, '_blank')}>
                        Abrir
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        component="a"
                        href={resultTabUrl}
                        download={`aba-${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`}
                        startIcon={<DownloadOutlined />}
                      >
                        Baixar MP3
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}
              {resultMicUrl && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Áudio do microfone
                  </Typography>
                  <audio controls src={resultMicUrl} style={{ width: '100%' }} />
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {sizeLabel(resultMicBlob)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => window.open(resultMicUrl!, '_blank')}>
                        Abrir
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        component="a"
                        href={resultMicUrl}
                        download={`microfone-${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`}
                        startIcon={<DownloadOutlined />}
                      >
                        Baixar MP3
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            if (isBusy) return;
            onClose();
          }}
          disabled={isBusy}
        >
          Fechar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          onClick={() => {
            hardReset();
            resetResult();
            setStatus('idle');
            setError(null);
          }}
          disabled={status === 'preparing' || status === 'recording' || status === 'stopping'}
        >
          Limpar
        </Button>

        <Button variant="contained" startIcon={<AudioOutlined />} onClick={handleStart} disabled={!canStart || isBusy}>
          Iniciar
        </Button>

        <Button color="error" variant="contained" startIcon={<StopOutlined />} onClick={handleStop} disabled={!canStop || isBusy}>
          Parar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import type { StageResult } from '@clipstream/shared';
import type { IWhisperAdapter, TranscriptOutput, TranscriptSegment } from '../adapters/whisper.js';

export interface TranscriptStageData {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  hash: `0x${string}`;
  noSpeech: boolean;
}

export async function executeTranscriptStage(
  videoId: string,
  whisperAdapter: IWhisperAdapter,
  cachedTranscript?: TranscriptStageData
): Promise<StageResult<TranscriptStageData>> {
  const startTime = Date.now();

  if (cachedTranscript) {
    return {
      stage: 'transcript',
      status: 'PASS',
      data: cachedTranscript,
      durationMs: Date.now() - startTime,
      modelVersion: 'whisper-large-v3',
    };
  }

  let output: TranscriptOutput;
  try {
    output = await whisperAdapter.transcribe(videoId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'ASR processing failed';
    return {
      stage: 'transcript',
      status: 'ERROR',
      data: {
        segments: [],
        fullText: '',
        language: 'unknown',
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        noSpeech: true,
      },
      reason: `Gagal memproses transkrip audio klip: ${message}`,
      durationMs: Date.now() - startTime,
      modelVersion: 'whisper-large-v3',
    };
  }

  return {
    stage: 'transcript',
    status: 'PASS',
    data: {
      segments: output.segments,
      fullText: output.fullText,
      language: output.language,
      hash: output.hash,
      noSpeech: output.noSpeech,
    },
    durationMs: Date.now() - startTime,
    modelVersion: 'whisper-large-v3',
  };
}

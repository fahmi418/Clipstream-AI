import { keccak256, toHex } from 'viem';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptOutput {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  hash: `0x${string}`;
  noSpeech: boolean;
}

export interface IWhisperAdapter {
  transcribe(videoId: string): Promise<TranscriptOutput>;
}

export class WhisperAdapter implements IWhisperAdapter {
  private readonly endpointUrl: string;

  constructor(endpointUrl = 'http://localhost:8000/transcribe') {
    this.endpointUrl = endpointUrl;
  }

  async transcribe(videoId: string): Promise<TranscriptOutput> {
    const res = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    if (!res.ok) {
      throw new Error(`Whisper ASR request failed: ${res.statusText}`);
    }

    const data = (await res.json()) as {
      segments: TranscriptSegment[];
      fullText: string;
      language: string;
    };

    const cleanText = data.fullText.trim();
    const hash = keccak256(toHex(cleanText));
    const noSpeech = cleanText.length < 40;

    return {
      segments: data.segments || [],
      fullText: cleanText,
      language: data.language || 'id',
      hash,
      noSpeech,
    };
  }
}

export class MockWhisperAdapter implements IWhisperAdapter {
  private readonly transcripts: Map<string, { segments: TranscriptSegment[]; fullText: string; language?: string }> = new Map();

  setTranscript(videoId: string, fullText: string, segments?: TranscriptSegment[], language = 'id'): void {
    const segs = segments || [{ start: 0, end: 30, text: fullText }];
    this.transcripts.set(videoId, { segments: segs, fullText, language });
  }

  async transcribe(videoId: string): Promise<TranscriptOutput> {
    const record = this.transcripts.get(videoId) || {
      segments: [{ start: 0, end: 30, text: 'Halo semua selamat datang di review klip terbaru kami' }],
      fullText: 'Halo semua selamat datang di review klip terbaru kami',
      language: 'id',
    };

    const cleanText = record.fullText.trim();
    const hash = keccak256(toHex(cleanText));
    const noSpeech = cleanText.length < 40;

    return {
      segments: record.segments,
      fullText: cleanText,
      language: record.language || 'id',
      hash,
      noSpeech,
    };
  }
}

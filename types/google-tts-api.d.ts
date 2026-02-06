declare module 'google-tts-api' {
  interface TTSOptions {
    lang?: string;
    slow?: boolean;
    host?: string;
    timeout?: number;
  }

  export function getAudioUrl(text: string, options?: TTSOptions): string;
  export function getAllAudioUrls(text: string, options?: TTSOptions): { url: string; shortText: string }[];
}

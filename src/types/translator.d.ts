// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3
// Chrome 内蔵 Translator API の ambient 型（TS 標準 lib 未収載）。
// 出典: https://developer.chrome.com/docs/ai/translator-api （Chrome / Edge 138+・デスクトップのみ）
export {};

declare global {
  type TranslatorAvailability =
    | 'available'
    | 'downloadable'
    | 'downloading'
    | 'after-download'
    | 'unavailable';

  interface TranslatorDownloadMonitor extends EventTarget {
    addEventListener(
      type: 'downloadprogress',
      listener: (e: Event & { loaded?: number }) => void,
    ): void;
  }

  interface TranslatorCreateOptions {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (m: TranslatorDownloadMonitor) => void;
  }

  interface TranslatorInstance {
    translate(text: string): Promise<string>;
    translateStreaming(text: string): AsyncIterable<string>;
    destroy?(): void;
  }

  // 実行時に存在しない環境（Safari / Firefox / モバイル / 旧 Chrome）があるため、
  // 呼び出し側は必ず `'Translator' in self` で feature detect してから使う。
  // eslint-disable-next-line no-var
  var Translator: {
    availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorAvailability>;
    create(opts: TranslatorCreateOptions): Promise<TranslatorInstance>;
  };
}

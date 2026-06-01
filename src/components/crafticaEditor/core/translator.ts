// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3
// kojinius 移植時に追加: Chrome 内蔵 Translator API（オンデバイス AI）ラッパー。
// 日本語 → 英語のリアルタイム翻訳に使用。外部送信ゼロ・無料・API キー不要。
// 非対応環境（Safari / Firefox / モバイル / 旧 Chrome）では isTranslatorSupported() が false。
// 設計書: documents/design/craftica-editor-port-to-kojinius.md §15

export interface OnDeviceTranslator {
  translate(text: string): Promise<string>;
  destroy?(): void;
}

/** Translator API が使えるブラウザか（feature detect） */
export function isTranslatorSupported(): boolean {
  return typeof self !== 'undefined' && 'Translator' in self;
}

/** ja→en の利用可否を返す。非対応ブラウザは 'unsupported' */
export async function getJaEnAvailability(): Promise<TranslatorAvailability | 'unsupported'> {
  if (!isTranslatorSupported()) return 'unsupported';
  try {
    return await Translator.availability({ sourceLanguage: 'ja', targetLanguage: 'en' });
  } catch {
    return 'unavailable';
  }
}

/**
 * ja→en の translator を生成。モデル未取得なら DL が走る（onProgress に 0–100 を通知）。
 * 非対応ブラウザでは null。
 */
export async function createJaEnTranslator(
  onProgress?: (pct: number) => void,
): Promise<OnDeviceTranslator | null> {
  if (!isTranslatorSupported()) return null;
  const tr = await Translator.create({
    sourceLanguage: 'ja',
    targetLanguage: 'en',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        onProgress?.(Math.round((e.loaded ?? 0) * 100));
      });
    },
  });
  return tr as OnDeviceTranslator;
}

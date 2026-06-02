'use client';

// 2026-05-04 claude-sonnet-4-6 セッションターン数：5
// 2026-05-10 02:00:00 claude-opus-4-7[1m] セッションターン数：38 — Craftica 移植
// 2026-05-10 04:00:00 claude-opus-4-7[1m] セッションターン数：53 — Phase 1-3
// 2026-05-11 10:00:00 claude-opus-4-7[1m] セッションターン数：- Phase 6
//   1688 行を分割：
//   - 純粋関数 / 定数 / Prism import → core/languageDetection.ts
//   - 永続化 → core/tabsManager.ts
//   - 絵文字データ → core/emojiData.ts
//   - 共有型 → types.ts

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// 2026-06-01 claude-opus-4-8[1m] セッションターン数：1 — kojinius 移植: 課題提出フロー除去に伴い
//   next/navigation・@vercel/blob・jszip・sonner・firebase の import を撤去（公開ツール・BE 無し）。
import { getCaretWord, getMarkdownLineMarker, findLesson, type Lesson } from './lessons';
import type { Tab, ViewMode, CrafticaEditorProps } from './types';
import {
  type PrismLang,
  detectLanguage,
  highlightCode,
  isLivePreviewable,
  buildPreviewSrcdoc,
  parseMd,
  escHtml,
  LANG_LABEL,
  LANG_SHORT_LABEL,
  LANG_TO_EXT,
  LANG_PICKER_OPTIONS,
} from './core/languageDetection';
import { loadTabs, saveTabs } from './core/tabsManager';
import { EMOJIS, type EmojiEntry } from './core/emojiData';
// 2026-05-11 [opus-4-7] Phase 6: Runner Framework 統合
import { useRunner } from './useRunner';
import RunnerOutput from './preview/RunnerOutput';
import LoaderMessages from './loader/LoaderMessages';
// 2026-05-11 20:00:00 claude-opus-4-7[1m] セッションターン数：28 — PDF 出力で RunResult 型必要
import type { RunResult } from './runner/types';
// 2026-05-11 14:30:00 claude-opus-4-7[1m] セッションターン数：11 — Phase 10: Mistake → Lesson
import { mistakeToLesson } from './educator/mistakeToLesson';
// 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13 — Phase 14: Guided Completion
import { getCompletions, type CompletionItem } from './educator/completion';
// 2026-05-11 16:00:00 claude-opus-4-7[1m] セッションターン数：15 — Phase 15: Reference Linker
import { getReferenceLink } from './educator/referenceLinker';
// 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21 — Phase 18b: TTS
import { speak, stopSpeak, isSpeechSupported } from './educator/speak';
// 2026-05-11 [opus-4-7] Phase 7+: 言語別 Runner を REGISTRY に登録
//   副作用 import は Webpack tree-shaking で除去されるため、関数化して明示呼び出し
import { registerAllRunners } from './runner/registerAll';
// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — kojinius 移植: オンデバイス翻訳（Chrome Translator API）
import { isTranslatorSupported, createJaEnTranslator, type OnDeviceTranslator } from './core/translator';
registerAllRunners();

export type { CrafticaEditorProps } from './types';

// 2026-05-11 19:00:00 claude-opus-4-7[1m] セッションターン数：23
// EMPTY_LIVE_PREVIEW_SRCDOC は廃止。buildPreviewSrcdoc が markup 空タブで
// 「真っ白 HTML」を返す方式に変更（ブラウザ empty index.html と同等、ボス指示）。

/* ════════════════════════════════════
   コンポーネント本体
   ════════════════════════════════════ */
export default function CrafticaEditor({
  learner,
  course,
  onMistake,
  onMastery,
  reducedMotion = false,
  preferredLanguage,
}: CrafticaEditorProps = {}) {
  // 2026-05-10 05:00:00 claude-opus-4-7[1m] セッションターン数：54
  // Phase 4: callback / learner を ref に保存（Phase 5+ の closure 内参照用）
  const learnerRef = useRef(learner);
  const onMistakeRef = useRef(onMistake);
  const onMasteryRef = useRef(onMastery);
  useEffect(() => {
    learnerRef.current = learner;
    onMistakeRef.current = onMistake;
    onMasteryRef.current = onMastery;
  });

  const counterRef   = useRef(0);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const lineNumRef   = useRef<HTMLDivElement>(null);
  // 2026-05-10 04:00:00 claude-opus-4-7[1m] セッションターン数：53
  // Prism シンタックスハイライト overlay（textarea の上に重ねる）
  const overlayRef = useRef<HTMLPreElement>(null);
  // 2026-05-05 claude-opus-4-7 セッションターン数：1
  // 分割プレビュー：両ペインのスクロール同期用
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const scrollSyncingRef = useRef(false);
  // 2026-05-05 claude-opus-4-7 セッションターン数：2
  // 分割プレビュー：中央ハンドルでのリサイズ用
  const panelsRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const lastHandleRef = useRef<FileSystemFileHandle | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const globalKeyRef  = useRef<(e: KeyboardEvent) => void>(null!);

  const [tabs, setTabs]           = useState<Tab[]>([]);
  const [activeId, setActiveId]   = useState(0);
  const [view, setView]           = useState<ViewMode>('split');
  const [fileMenu, setFileMenu]   = useState(false);
  const [closeDlgId, setCloseDlgId] = useState<number | null>(null);
  const [preview, setPreview]     = useState('');
  // 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — kojinius 移植: 日→英オンデバイス翻訳ペイン
  type TranslatorStatus = 'idle' | 'unsupported' | 'downloading' | 'translating' | 'ready' | 'error';
  const [translatedText, setTranslatedText] = useState('');
  const [translatorStatus, setTranslatorStatus] = useState<TranslatorStatus>('idle');
  const [downloadPct, setDownloadPct] = useState(0);
  // 2026-06-02 claude-opus-4-8[1m] セッションターン数：3 — クロスオリジン iframe 埋め込み検出。
  //   Chrome 内蔵 Translator API は「トップレベル窓＋同一オリジン iframe」のみに露出するため、
  //   Kalenex 等への埋め込み時は誤って「未対応」と出さず、トップレベルで開く導線を出す。
  const [inIframe, setInIframe] = useState(false);
  useEffect(() => { try { setInIframe(window.self !== window.top); } catch { setInIframe(true); } }, []);
  // 自動翻訳 ON/OFF トグル（ボス要望）。localStorage 永続・既定 ON。
  const [autoTranslate, setAutoTranslate] = useState<boolean>(() => {
    try { return localStorage.getItem('md-editor-autotranslate') !== 'false'; } catch { return true; }
  });
  const translatorRef = useRef<OnDeviceTranslator | null>(null);
  // 2026-06-02 claude-opus-4-8[1m] セッションターン数：5 — review fix: アンマウント時に translator を破棄
  useEffect(() => () => { translatorRef.current?.destroy?.(); translatorRef.current = null; }, []);
  useEffect(() => {
    try { localStorage.setItem('md-editor-autotranslate', String(autoTranslate)); } catch { /* ignore */ }
  }, [autoTranslate]);
  // 翻訳ビューに入った時点で非対応ブラウザを判定（空文でもフォールバック表示するため）
  useEffect(() => {
    if (view === 'translate' && !isTranslatorSupported()) setTranslatorStatus('unsupported');
  }, [view]);
  // ja→en translator を遅延生成（初回翻訳時。モデル未取得なら DL 進捗を通知）
  async function ensureTranslator(): Promise<OnDeviceTranslator | null> {
    if (translatorRef.current) return translatorRef.current;
    const tr = await createJaEnTranslator((pct) => { setTranslatorStatus('downloading'); setDownloadPct(pct); });
    translatorRef.current = tr;
    return tr;
  }
  async function runTranslate(text: string): Promise<void> {
    if (!isTranslatorSupported()) { setTranslatorStatus('unsupported'); return; }
    try {
      setTranslatorStatus('translating');
      const tr = await ensureTranslator();
      if (!tr) { setTranslatorStatus('unsupported'); return; }
      const out = await tr.translate(text);
      setTranslatedText(out);
      setTranslatorStatus('ready');
    } catch {
      setTranslatorStatus('error');
    }
  }
  // 自動翻訳: translate ビュー かつ ON のとき、入力を 500ms デバウンスして翻訳
  useEffect(() => {
    if (view !== 'translate' || !autoTranslate) return;
    const text = tabs.find(t => t.id === activeId)?.content ?? '';
    if (!text.trim()) { setTranslatedText(''); return; }
    const h = setTimeout(() => { void runTranslate(text); }, 500);
    return () => clearTimeout(h);
    // runTranslate は安定参照不要（毎 render 再生成でも debounce で吸収）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, autoTranslate, tabs, activeId]);
  // 2026-05-10 23:30:00 claude-opus-4-7[1m] セッションターン数：36 — MDコピー / 言語 onboarding chip
  //   ボス指示:「MDをコピー」を選択言語名に動的変更 + 課題からエディタ起動直後 5 秒間
  //   「ここで提出するコードを選択してね」吹き出しをバウンドで表示。
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  // 2026-05-11 00:30:00 claude-opus-4-7[1m] セッションターン数：39 — onboarding 吹き出しバグ修正
  //   旧実装は `useState(!!course)` で初期値固定 + 引数なし useEffect だったが、CrafticaEditor は
  //   EditorPage の Firestore fetch 完了より先に mount されるため初回 course=undefined → 永遠 false 固定。
  //   course?.courseId を deps にした useEffect で、course が初めて確定した時に true → 5s で false。
  const [showLangOnboardingChip, setShowLangOnboardingChip] = useState(false);
  // 2026-06-01 claude-opus-4-8[1m] セッションターン数：1 — kojinius 移植: 提出 state / router を除去
  useEffect(() => {
    if (!course?.courseId) return;
    setShowLangOnboardingChip(true);
    const timer = setTimeout(() => setShowLangOnboardingChip(false), 5000);
    return () => clearTimeout(timer);
  }, [course?.courseId]);
  // 2026-05-10 04:00:00 claude-opus-4-7[1m] セッションターン数：53
  // Phase 1-3: Prism ハイライト + ライブプレビュー
  const [highlighted, setHighlighted] = useState('');
  const [previewSrcdoc, setPreviewSrcdoc] = useState('');
  // 2026-05-10 06:00:00 claude-opus-4-7[1m] セッションターン数：57
  // Phase 5: 学習バー — カーソル位置のキーワード解説
  const [currentLesson, setCurrentLesson] = useState<{ keyword: string; lesson: Lesson } | null>(null);
  const [lessonExpanded, setLessonExpanded] = useState(false);
  // 2026-05-10 11:45:00 claude-opus-4-7[1m] セッションターン数：69 — fix:
  //   モーダルを開いた瞬間の lesson を pin。閉じるまで textarea 変化の影響を受けない。
  const [pinnedLesson, setPinnedLesson] = useState<{ keyword: string; lesson: Lesson } | null>(null);
  // 2026-05-10 07:00:00 claude-opus-4-7[1m] セッションターン数：59 — Phase 5 fix: コピーフィードバック
  const [exampleCopied, setExampleCopied] = useState(false);
  // 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21 — Phase 18b: TTS 読み上げ中フラグ
  const [lessonSpeaking, setLessonSpeaking] = useState(false);
  const lessonTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // 2026-05-10 07:30:00 claude-opus-4-7[1m] セッションターン数：60
  // タブ rename: ダブルクリックで編集モード → 拡張子変えれば言語自動切替
  const [renamingTabId, setRenamingTabId] = useState<number | null>(null);
  const [renameInput, setRenameInput] = useState('');
  // 2026-05-10 08:00:00 claude-opus-4-7[1m] セッションターン数：61
  // panel header から言語ピッカーで切替（メインの言語切替手段）
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  // 2026-05-10 11:00:00 claude-opus-4-7[1m] セッションターン数：67 — キーボード操作
  const [langPickerIdx, setLangPickerIdx] = useState(0);
  const langPickerItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [stats, setStats]         = useState({ chars: '0 文字', words: '0 単語', lines: '1 行' });
  const [savedLabel, setSavedLabel] = useState<{ text: string; color: string }>({ text: '● 自動保存済み', color: '#a6e3a1' });
  // 2026-05-10 08:30:00 claude-opus-4-7[1m] セッションターン数：61 — Phase 5 fix:
  //   currentLang は useEffect の deps として参照するため、useState 群の直後で算出。
  //   useMemo 化して tabs/activeId/preferredLanguage 変化時のみ再計算。
  const currentLang: PrismLang = useMemo(() => {
    const name = tabs.find(t => t.id === activeId)?.name ?? 'untitled.md';
    return preferredLanguage ?? detectLanguage(name);
  }, [tabs, activeId, preferredLanguage]);

  // 2026-05-11 [opus-4-7] Phase 6: Runner Framework hook
  //   Tier A は iframe srcdoc 経路（既存挙動維持）。Tier B+ で ▶ 実行 / Ctrl+Enter で本 hook 経由
  const runner = useRunner(currentLang);
  const isTierBPlus = runner.tier !== 'A' && runner.tier !== 'unknown';

  const triggerRun = useCallback(async () => {
    if (!isTierBPlus) return;
    const ta = textareaRef.current;
    if (!ta) return;
    try {
      await runner.run(ta.value);
    } catch (e) {
      // useRunner 側で error state にセットされているのでここは握り潰し（RunnerOutput / LoaderMessages が表示）
      console.warn('[CrafticaEditor] runner.run failed:', e);
    }
  }, [isTierBPlus, runner]);

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: triggerTrace
  const triggerTrace = useCallback(async () => {
    if (!runner.isTraceable) return;
    const ta = textareaRef.current;
    if (!ta) return;
    try {
      await runner.trace(ta.value);
    } catch (e) {
      console.warn('[CrafticaEditor] runner.trace failed:', e);
    }
  }, [runner]);

  // 2026-05-11 14:30:00 claude-opus-4-7[1m] セッションターン数：11
  // Phase 10: Runner エラー時に Mistake → Lesson 変換 → onMistake callback 発火
  //   設計書: documents/design/craftica-editor-phase-10-mistake-to-lesson.md
  //   親（learner プロパティを渡している場合）が学習履歴に記録する想定。
  useEffect(() => {
    const r = runner.lastResult;
    if (!r || r.ok || !r.stderr) return;
    const m = mistakeToLesson(currentLang, r.stderr);
    if (m && onMistakeRef.current) {
      onMistakeRef.current({
        code: m.type,
        type: 'runner_error',
        explanation: m.lesson.detail ?? m.lesson.short,
      });
    }
  }, [runner.lastResult, currentLang]);
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：6
  const [emojiPicker, setEmojiPicker] = useState<{ query: string; top: number; left: number; idx: number } | null>(null);
  const emojiPickerDivRef = useRef<HTMLDivElement>(null);

  /* 絵文字ピッカー：選択アイテムを自動スクロール */
  useEffect(() => {
    if (!emojiPickerDivRef.current) return;
    const el = emojiPickerDivRef.current.querySelector<HTMLElement>('[data-sel]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [emojiPicker?.idx]);

  /* 絵文字ピッカー：外側クリックで閉じる */
  useEffect(() => {
    if (!emojiPicker) return;
    const h = (e: MouseEvent) => {
      if (!emojiPickerDivRef.current?.contains(e.target as Node)) setEmojiPicker(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [!!emojiPicker]);

  // 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13
  // Phase 14: Guided Completion — Ctrl+Space で開く補完ピッカー
  // 設計書: documents/design/craftica-editor-phase-14-guided-completion.md
  const [completion, setCompletion] = useState<{ prefix: string; top: number; left: number; idx: number } | null>(null);
  const completionDivRef = useRef<HTMLDivElement>(null);

  /* 補完ピッカー：選択アイテムを自動スクロール */
  useEffect(() => {
    if (!completionDivRef.current) return;
    const el = completionDivRef.current.querySelector<HTMLElement>('[data-sel]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [completion?.idx]);

  /* 補完ピッカー：外側クリックで閉じる */
  useEffect(() => {
    if (!completion) return;
    const h = (e: MouseEvent) => {
      if (!completionDivRef.current?.contains(e.target as Node)) setCompletion(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [!!completion]);

  /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
  /* 分割ハンドル：ドラッグ中のグローバルマウスイベント */
  // 2026-05-11 19:00:00 claude-opus-4-7[1m] セッションターン数：23
  // fix: ドラッグ中の「ガックガク」解消。
  //   1. mousemove → rAF で 1 フレームに 1 回までスロットル
  //   2. ドラッグ中は React state を更新せず CSS 変数 --split-ratio を直接書く
  //      → React 再 render / reconcile を完全スキップ
  //   3. ドロップ時に setSplitRatio で最終値を React state に同期（次のレンダー保持）
  useEffect(() => {
    if (!dragging) return;
    let rafId: number | null = null;
    let lastClientX = 0;
    let pendingRatio = splitRatio;
    const onMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = panelsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const ratio = Math.max(0.1, Math.min(0.9, (lastClientX - rect.left) / rect.width));
        pendingRatio = ratio;
        // React state を介さず CSS 変数を直接書き換え（再レンダリングなし）
        el.style.setProperty('--split-ratio', String(ratio));
      });
    };
    const onUp = () => {
      // ドロップ時にだけ React state に同期（最終値を保持）
      setSplitRatio(pendingRatio);
      setDragging(false);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
    // 2026-05-11 — splitRatio を deps に入れない（ドラッグ中値が変わって effect 再 attach されるとカクつく）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  /* タイトル設定 */
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：8
  // manifestはdist/md-editor.htmlに静的リンクとして埋め込み済み。動的注入廃止。
  useEffect(() => {
    const prevTitle = document.title;
    // 2026-05-10 03:00:00 claude-opus-4-7[1m] — Craftica 移植: title を Craftica Editor に
    document.title = 'Craftica Editor';
    return () => { document.title = prevTitle; };
  }, []);

  /* 初期ロード */
  useEffect(() => {
    const saved = loadTabs();
    if (saved && saved.tabs.length > 0) {
      counterRef.current = Math.max(...saved.tabs.map(t => t.id));
      setTabs(saved.tabs);
      setActiveId(saved.activeId);
    } else {
      counterRef.current = 1;
      const t: Tab = { id: 1, name: 'untitled.md', content: '', saved: true, fileHandle: null, scrollTop: 0 };
      setTabs([t]);
      setActiveId(1);
    }
  }, []);

  /* アクティブタブが変わったら textarea を更新 */
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeId);
    if (!tab || !textareaRef.current) return;
    // 2026-05-10 08:30:00 claude-opus-4-7[1m] — Phase 5 fix:
    //   言語切替時（同タブ内）はカーソル位置を維持するため、content 一致時は value 上書きしない
    if (textareaRef.current.value !== tab.content) {
      textareaRef.current.value     = tab.content;
      textareaRef.current.scrollTop = tab.scrollTop;
    }
    updateLineNumbers(tab.content);
    updateStats(tab.content);
    // 2026-05-10 04:00:00 claude-opus-4-7[1m] セッションターン数：53
    // 2026-05-10 05:00:00 claude-opus-4-7[1m] — Phase 4: preferredLanguage 優先
    const lang = preferredLanguage ?? detectLanguage(tab.name);
    setHighlighted(highlightCode(tab.content, lang));
    if (lang === 'markdown') {
      setPreview(parseMd(tab.content));
      setPreviewSrcdoc('');
    } else if (isLivePreviewable(lang)) {
      setPreviewSrcdoc(buildPreviewSrcdoc(tab.content, lang));
      setPreview('');
    } else {
      setPreview('');
      setPreviewSrcdoc('');
    }
    // 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: タブ切替時に学習バーリセット
    setCurrentLesson(null);
    setLessonExpanded(false);
    setPinnedLesson(null);
    // 2026-05-10 08:30:00 claude-opus-4-7[1m] — Phase 5 fix: 言語ピッカーで言語切替した時もプレビュー再計算
    //   currentLang を deps に追加。currentLang は useMemo(name, preferredLanguage)。
  }, [activeId, tabs.length, currentLang]); // eslint-disable-line react-hooks/exhaustive-deps

  /* グローバルショートカット — 毎レンダーで最新のクロージャに更新 */
  useEffect(() => {
    globalKeyRef.current = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 't') { e.preventDefault(); createTab(); return; }
        if (e.key === 'w') { e.preventDefault(); requestCloseTab(activeId); return; }
        if (e.key === 'Tab') {
          e.preventDefault();
          const idx = tabs.findIndex(t => t.id === activeId);
          if (tabs.length > 1) {
            const next = e.shiftKey
              ? (idx - 1 + tabs.length) % tabs.length
              : (idx + 1) % tabs.length;
            switchTab(tabs[next].id);
          }
          return;
        }
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === 't' || e.key === 'T') { e.preventDefault(); createTab(); return; }
        if (e.key === 'w' || e.key === 'W') { e.preventDefault(); requestCloseTab(activeId); return; }
        if (e.key === '.' || e.key === '>') {
          e.preventDefault();
          const idx = tabs.findIndex(t => t.id === activeId);
          if (tabs.length > 1) switchTab(tabs[(idx + 1) % tabs.length].id);
          return;
        }
        if (e.key === ',' || e.key === '<') {
          e.preventDefault();
          const idx = tabs.findIndex(t => t.id === activeId);
          if (tabs.length > 1) switchTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
          return;
        }
        if (e.key === '1') { e.preventDefault(); setView('split');   return; }
        if (e.key === '2') { e.preventDefault(); setView('editor');  return; }
        if (e.key === '3') { e.preventDefault(); setView('preview'); return; }
        // 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — Alt+4: 翻訳ペイン
        if (e.key === '4') { e.preventDefault(); setView('translate'); return; }
        if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setFileMenu(v => !v); return; }
        if (e.key === 'o' || e.key === 'O') { e.preventDefault(); openFile(); return; }
        // 2026-05-11 20:15:00 claude-opus-4-7[1m] セッションターン数：29 — Alt+P で PDF 出力
        if (e.key === 'p' || e.key === 'P') { e.preventDefault(); exportPdf(); return; }
        // 2026-05-10 10:30:00 claude-opus-4-7[1m] — Phase 5: ショートカット追加
        if (e.key === 'h' || e.key === 'H') {
          // Alt+H: 詳しく popup を開く（カーソル下にキーワード解説がある時のみ）
          // 2026-05-10 11:45:00 — fix: 開いた瞬間の lesson を pin
          e.preventDefault();
          if (currentLesson) {
            setPinnedLesson(currentLesson);
            setLessonExpanded(true);
          }
          return;
        }
        if (e.key === 'l' || e.key === 'L') {
          // Alt+L: 言語ピッカー開閉
          e.preventDefault();
          setLangPickerOpen(v => !v);
          return;
        }
      }
      // 2026-05-10 11:45:00 claude-opus-4-7[1m] — Phase 5: lesson popup の Esc 閉じ（最優先）
      // 2026-05-11 18:15:00 — Phase 18b: 読み上げ中なら停止も
      if (lessonExpanded && e.key === 'Escape') {
        e.preventDefault();
        stopSpeak();
        setLessonSpeaking(false);
        setLessonExpanded(false);
        setPinnedLesson(null);
        return;
      }
      // 2026-05-10 12:00:00 claude-opus-4-7[1m] セッションターン数：70 — Ctrl+C で example コピー
      // ただしユーザーが popup 内テキストを選択している時は標準コピー優先
      if (lessonExpanded && pinnedLesson?.lesson.example && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        const sel = window.getSelection();
        if (!sel || sel.toString().length === 0) {
          e.preventDefault();
          navigator.clipboard.writeText(pinnedLesson.lesson.example).then(() => {
            setExampleCopied(true);
            setTimeout(() => setExampleCopied(false), 1800);
          }).catch(() => { /* clipboard 不可環境は無視 */ });
        }
        return;
      }
      // 2026-05-11 19:55:00 claude-opus-4-7[1m] セッションターン数：27
      // Lesson popup 内で Enter → ➕ 挿入（modal の OK 慣例、Ctrl+C コピーと並列）
      if (lessonExpanded && pinnedLesson?.lesson.example && e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const ta = textareaRef.current;
        const ex = pinnedLesson.lesson.example;
        if (ta && ex) {
          const s = ta.selectionStart;
          const en = ta.selectionEnd;
          ta.setRangeText(ex, s, en, 'end');
          stopSpeak();
          setLessonSpeaking(false);
          setLessonExpanded(false);
          setPinnedLesson(null);
          ta.focus();
          handleInput();
        }
        return;
      }
      // 2026-05-10 11:00:00 claude-opus-4-7[1m] — Phase 5: 言語ピッカーキーボード操作
      if (langPickerOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setLangPickerIdx(i => (i + 1) % LANG_PICKER_OPTIONS.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setLangPickerIdx(i => (i - 1 + LANG_PICKER_OPTIONS.length) % LANG_PICKER_OPTIONS.length);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const opt = LANG_PICKER_OPTIONS[langPickerIdx];
          if (opt) pickLanguage(opt.lang);  // pickLanguage 内で setLangPickerOpen(false) + textarea focus
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setLangPickerOpen(false);
          requestAnimationFrame(() => textareaRef.current?.focus());
          return;
        }
      }
      if (fileMenu) {
        if (e.key === 'Escape') { e.preventDefault(); setFileMenu(false); return; }
        if (e.key === 'o' || e.key === 'O') { e.preventDefault(); setFileMenu(false); openFile(); return; }
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setFileMenu(false); saveToFile(true); return; }
        if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setFileMenu(false); copyMarkdown(); return; }
      }
      if (closeDlgId !== null && e.key === 'Escape') { e.preventDefault(); setCloseDlgId(null); }
    };
  });

  /* document へのリスナー登録（マウント時1回のみ） */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => globalKeyRef.current(e);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* ── ヘルパー ── */
  // 2026-05-10 06:00:00 claude-opus-4-7[1m] セッションターン数：57
  // 2026-05-10 07:00:00 claude-opus-4-7[1m] セッションターン数：59 — fix: markdown 行頭マーカー fallback
  // Phase 5: 学習バー更新（debounce 80ms、O(1) lookup でサクサク）
  function updateLesson() {
    if (lessonTimerRef.current) clearTimeout(lessonTimerRef.current);
    lessonTimerRef.current = setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) { setCurrentLesson(null); return; }
      const word = getCaretWord(ta.value, ta.selectionStart);
      let result = findLesson(currentLang, word);
      // markdown は `1.` / ``` / `|` のような行頭マーカーも fallback で拾う
      if (!result && currentLang === 'markdown') {
        const marker = getMarkdownLineMarker(ta.value, ta.selectionStart);
        if (marker) result = findLesson(currentLang, marker);
      }
      setCurrentLesson(result);
    }, 80);
  }

  // 2026-05-04 claude-sonnet-4-6 セッションターン数：6
  function getCaretPixelPos(ta: HTMLTextAreaElement) {
    const cs = window.getComputedStyle(ta);
    const taRect = ta.getBoundingClientRect();
    const mirror = document.createElement('div');
    mirror.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;overflow:hidden;white-space:pre-wrap;word-wrap:break-word;top:${taRect.top - ta.scrollTop}px;left:${taRect.left}px;width:${ta.clientWidth}px;font-family:${cs.fontFamily};font-size:${cs.fontSize};line-height:${cs.lineHeight};padding:${cs.padding};box-sizing:${cs.boxSizing};`;
    mirror.textContent = ta.value.substring(0, ta.selectionStart);
    const span = document.createElement('span');
    span.textContent = '​';
    mirror.appendChild(span);
    document.body.appendChild(mirror);
    const r = span.getBoundingClientRect();
    document.body.removeChild(mirror);
    return { top: r.bottom + 4, left: r.left };
  }

  function insertEmoji(emoji: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const m = ta.value.substring(0, pos).match(/:([^\s:]*)$/);
    if (m) ta.setRangeText(emoji, pos - m[0].length, pos, 'end');
    setEmojiPicker(null);
    handleInput();
    ta.focus();
  }

  function updateLineNumbers(val: string) {
    if (!lineNumRef.current) return;
    const count = val.split('\n').length;
    lineNumRef.current.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
  }

  function updateStats(val: string) {
    const words = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
    setStats({ chars: `${val.length} 文字`, words: `${words} 単語`, lines: `${val.split('\n').length} 行` });
  }

  function newTabData(name = 'untitled.md'): Tab {
    counterRef.current++;
    return { id: counterRef.current, name, content: '', saved: true, fileHandle: null, scrollTop: 0 };
  }

  /* ── タブ操作 ── */
  const switchTab = useCallback((id: number) => {
    /* 現タブのスクロール位置を保存 */
    setTabs(prev => {
      const cur = prev.find(t => t.id === activeId);
      if (cur && textareaRef.current) {
        return prev.map(t => t.id === activeId ? { ...t, scrollTop: textareaRef.current!.scrollTop } : t);
      }
      return prev;
    });
    setActiveId(id);
  }, [activeId]);

  const createTab = useCallback(() => {
    const t = newTabData();
    setTabs(prev => [...prev, t]);
    setActiveId(t.id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  // 2026-05-10 07:30:00 claude-opus-4-7[1m] セッションターン数：60 — Phase 5 fix: タブ rename
  // タブをダブルクリックで名前を変更できる。拡張子で言語が自動切替。
  const startRename = useCallback((tabId: number) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    setRenamingTabId(tabId);
    setRenameInput(tab.name);
  }, [tabs]);

  const commitRename = useCallback(() => {
    if (renamingTabId === null) return;
    const newName = renameInput.trim();
    if (!newName) { setRenamingTabId(null); return; }
    setTabs(prev => prev.map(t =>
      t.id === renamingTabId ? { ...t, name: newName, saved: false } : t,
    ));
    setRenamingTabId(null);
  }, [renamingTabId, renameInput]);

  const cancelRename = useCallback(() => {
    setRenamingTabId(null);
  }, []);

  // 2026-05-10 08:00:00 claude-opus-4-7[1m] — Phase 5 fix: 言語ピッカーで切替
  // 現在タブの拡張子を新しい言語の主要拡張子に置き換える（base 名は維持）。
  // 2026-05-10 10:30:00 claude-opus-4-7[1m] — fix: 選択後すぐ書けるよう textarea にフォーカス
  const pickLanguage = useCallback((lang: PrismLang) => {
    const ext = LANG_TO_EXT[lang];
    setTabs(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      const base = t.name.replace(/\.[a-zA-Z0-9]+$/, '') || 'untitled';
      return { ...t, name: `${base}.${ext}`, saved: false };
    }));
    setLangPickerOpen(false);
    // 選択直後に書けるよう textarea へフォーカス（次フレームで確実に）
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [activeId]);

  // ピッカー外クリックで閉じる
  useEffect(() => {
    if (!langPickerOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && !target.closest('.md-lang-picker-dropdown') && !target.closest('.md-lang-picker-trigger')) {
        setLangPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langPickerOpen]);

  // 2026-05-10 11:00:00 claude-opus-4-7[1m] — Phase 5: ピッカー開いた時に現在言語を初期 idx に
  useEffect(() => {
    if (!langPickerOpen) return;
    const idx = LANG_PICKER_OPTIONS.findIndex(o => o.lang === currentLang);
    setLangPickerIdx(idx >= 0 ? idx : 0);
  }, [langPickerOpen, currentLang]);

  // 選択中アイテムを画面内にスクロール
  useEffect(() => {
    if (!langPickerOpen) return;
    langPickerItemRefs.current[langPickerIdx]?.scrollIntoView({ block: 'nearest' });
  }, [langPickerOpen, langPickerIdx]);

  const requestCloseTab = useCallback((id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;
    if (!tab.saved) { setCloseDlgId(id); } else { doCloseTab(id); }
  }, [tabs]);

  const doCloseTab = useCallback((id: number) => {
    setTabs(prev => {
      const idx  = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      if (next.length === 0) {
        const t = newTabData();
        setActiveId(t.id);
        if (textareaRef.current) textareaRef.current.value = '';
        return [t];
      }
      if (id === activeId) {
        const newActive = next[Math.min(idx, next.length - 1)].id;
        setActiveId(newActive);
      }
      return next;
    });
    setCloseDlgId(null);
  }, [activeId]);

  /* ── input イベント ── */
  function handleInput() {
    const val = textareaRef.current?.value ?? '';
    setTabs(prev => prev.map(t => t.id === activeId ? { ...t, content: val, saved: false } : t));
    // 2026-05-10 04:00:00 claude-opus-4-7[1m] セッションターン数：53
    // 2026-05-10 05:00:00 claude-opus-4-7[1m] — Phase 4: preferredLanguage 優先
    const curTab = tabs.find(t => t.id === activeId);
    const lang = preferredLanguage ?? detectLanguage(curTab?.name ?? 'untitled.md');
    setHighlighted(highlightCode(val, lang));
    if (lang === 'markdown') {
      setPreview(parseMd(val));
      setPreviewSrcdoc('');
    } else if (isLivePreviewable(lang)) {
      setPreviewSrcdoc(buildPreviewSrcdoc(val, lang));
      setPreview('');
    } else {
      setPreview('');
      setPreviewSrcdoc('');
    }
    updateLineNumbers(val);
    updateStats(val);
    // 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: 学習バー更新
    updateLesson();
    setSavedLabel({ text: '○ 未保存', color: '#f9e2af' });
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setTabs(prev => {
        saveTabs(prev, activeId);
        return prev;
      });
      setSavedLabel({ text: '● 自動保存済み (ローカル)', color: '#89b4fa' });
    }, 800);

    // 2026-05-04 claude-sonnet-4-6 セッションターン数：6
    const ta2 = textareaRef.current;
    if (ta2) {
      const cur = ta2.selectionStart;
      const m = ta2.value.substring(0, cur).match(/:([^\s:]*)$/);
      if (m) {
        const p = getCaretPixelPos(ta2);
        const top = Math.max(10, Math.min(p.top, window.innerHeight - 270));
        const left = Math.max(10, Math.min(p.left, window.innerWidth - 290));
        setEmojiPicker(prev => ({ query: m[1], top, left, idx: prev?.query === m[1] ? prev.idx : 0 }));
      } else {
        setEmojiPicker(null);
      }
      // 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13
      // Phase 14: completion 開いてる時、現単語 prefix を追従して候補を絞り込む
      if (completion) {
        const wordMatch = ta2.value.substring(0, ta2.selectionStart).match(/[\w-]+$/);
        const newPrefix = wordMatch ? wordMatch[0] : '';
        if (newPrefix !== completion.prefix) {
          setCompletion(prev => prev ? { ...prev, prefix: newPrefix, idx: 0 } : null);
        }
      }
    }
  }

  /* ── 挿入ヘルパー ── */
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：3
  // 選択なし時はプレースホルダー部分のみ選択状態にする（即テキスト入力を可能にするため）
  function insert(before: string, after = '') {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e);
    const ph = 'テキスト';
    ta.setRangeText(before + (sel || ph) + after, s, e, 'end');
    if (!sel) { ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + ph.length; }
    ta.focus();
    handleInput();
  }

  function wrapSel(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e);
    const ph = 'テキスト';
    ta.setRangeText(before + (sel || ph) + after, s, e, 'end');
    if (!sel) { ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + ph.length; }
    ta.focus();
    handleInput();
  }

  function insertLink()  { const ta = textareaRef.current; if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd; const sel = ta.value.substring(s, e); const ph = 'リンクテキスト'; ta.setRangeText(`[${sel || ph}](https://example.com)`, s, e, 'end'); if (!sel) { ta.selectionStart = s + 1; ta.selectionEnd = s + 1 + ph.length; } ta.focus(); handleInput(); }
  function insertImage() { const ta = textareaRef.current; if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText('![画像の説明](https://example.com/image.png)', s, e, 'select'); ta.focus(); handleInput(); }
  function insertHR()    { const ta = textareaRef.current; if (!ta) return; ta.setRangeText('\n\n---\n\n', ta.selectionStart, ta.selectionStart, 'end'); ta.focus(); handleInput(); }
  function insertCode()  { const ta = textareaRef.current; if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd; const sel = ta.value.substring(s, e); const ph = 'コードをここに'; const bef = '```\n'; ta.setRangeText(bef + (sel || ph) + '\n```', s, e, 'end'); if (!sel) { ta.selectionStart = s + bef.length; ta.selectionEnd = s + bef.length + ph.length; } ta.focus(); handleInput(); }
  function insertTable()   { const ta = textareaRef.current; if (!ta) return; ta.setRangeText('\n| 見出し1 | 見出し2 | 見出し3 |\n| --- | --- | --- |\n| セル1 | セル2 | セル3 |\n', ta.selectionStart, ta.selectionStart, 'end'); ta.focus(); handleInput(); }
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：5
  function insertCallout() { const ta = textareaRef.current; if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd; const sel = ta.value.substring(s, e); const ph = 'テキスト'; const bef = '<aside>📝 '; const aft = '</aside>'; ta.setRangeText(bef + (sel || ph) + aft, s, e, 'end'); if (!sel) { ta.selectionStart = s + bef.length; ta.selectionEnd = s + bef.length + ph.length; } ta.focus(); handleInput(); }

  /* ── ファイルを開く ── */
  async function openFile() {
    try {
      if ((window as any).showOpenFilePicker) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Markdown / Text', accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] } }],
          multiple: false,
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        counterRef.current++;
        const t: Tab = { id: counterRef.current, name: file.name, content, saved: true, fileHandle, scrollTop: 0 };
        setTabs(prev => [...prev, t]);
        setActiveId(t.id);
        setTimeout(() => textareaRef.current?.focus(), 0);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const content = await file.text();
          counterRef.current++;
          const t: Tab = { id: counterRef.current, name: file.name, content, saved: true, fileHandle: null, scrollTop: 0 };
          setTabs(prev => [...prev, t]);
          setActiveId(t.id);
          setTimeout(() => textareaRef.current?.focus(), 0);
        };
        input.click();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }
  }

  /* ── ドラッグ＆ドロップ ── */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f =>
      /\.(md|markdown|txt)$/i.test(f.name) || f.type === 'text/plain' || f.type === 'text/markdown'
    );
    let lastId = -1;
    for (const file of files) {
      const content = await file.text();
      counterRef.current++;
      const id = counterRef.current;
      const t: Tab = { id, name: file.name, content, saved: true, fileHandle: null, scrollTop: 0 };
      setTabs(prev => [...prev, t]);
      lastId = id;
    }
    if (lastId !== -1) {
      setActiveId(lastId);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }

  /* ── ファイル保存 ── */
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：1
  // boolean 返却に変更：キャンセル時は false を返し、呼び出し元がタブ閉じをスキップできるように
  async function saveToFile(forceDialog = false): Promise<boolean> {
    const ta  = textareaRef.current;
    const tab = tabs.find(t => t.id === activeId);
    if (!tab || !ta) return false;
    const btn = document.getElementById('md-btn-save');

    let fileHandle = tab.fileHandle;
    try {
      if ((window as any).showSaveFilePicker && (forceDialog || !fileHandle)) {
        fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: tab.name,
          startIn: fileHandle || lastHandleRef.current || 'documents',
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown'] } }],
        });
        lastHandleRef.current = fileHandle;
      }
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(ta.value);
        await writable.close();
        lastHandleRef.current = fileHandle;
      } else throw new Error('no handle');
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      let name = tab.name;
      if (name === 'untitled.md' || forceDialog) {
        const input = window.prompt('ファイル名を入力してください', name);
        if (input === null) return false;
        name = input.trim() || name;
        if (!name.match(/\.(md|markdown)$/i)) name += '.md';
      }
      const blob = new Blob([ta.value], { type: 'text/markdown;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
      setTabs(prev => prev.map(t => t.id === activeId ? { ...t, name, saved: true, fileHandle } : t));
      setSavedLabel({ text: '● 自動保存済み', color: '#a6e3a1' });
      if (btn) { btn.textContent = '✅ 保存済み'; setTimeout(() => { if (btn) btn.textContent = '💾 ファイル保存'; }, 2000); }
      return true;
    }

    setTabs(prev => prev.map(t => t.id === activeId
      ? { ...t, name: (fileHandle as FileSystemFileHandle).name, saved: true, fileHandle }
      : t));
    setSavedLabel({ text: '● 自動保存済み', color: '#a6e3a1' });
    if (btn) { btn.textContent = '✅ 保存済み'; setTimeout(() => { if (btn) btn.textContent = '💾 ファイル保存'; }, 2000); }
    return true;
  }

  /* ── PDF 出力 ── */
  // 2026-05-11 20:00:00 claude-opus-4-7[1m] セッションターン数：28
  // 設計書: documents/design/craftica-editor-pdf-export.md
  // - markdown / markup / css: レンダリング状態を新規ウィンドウで描画 → print
  // - python / sql / ruby + runner.lastResult: stdout + artifacts を整形して print
  // - その他 (JS/TS/JSX/TSX 含む): ソースコードを syntax highlight 付き <pre> で print
  function exportPdf() {
    const curTab = tabs.find((t) => t.id === activeId);
    if (!curTab) return;
    const code = curTab.content;
    const title = curTab.name;

    // 出力 body 組立
    let bodyHtml: string;
    if (currentLang === 'markdown') {
      bodyHtml = `<article class="md-doc">${parseMd(code)}</article>`;
    } else if (currentLang === 'markup' || currentLang === 'css') {
      // HTML / SVG / CSS は buildPreviewSrcdoc の出力（完全な HTML doc）をそのまま使う
      // → 新規ウィンドウに直接書き込めばレンダリング状態で print 可能
      const fullDoc = buildPreviewSrcdoc(code, currentLang);
      const win0 = window.open('', '_blank', 'width=900,height=700');
      if (!win0) return;
      win0.document.open();
      win0.document.write(fullDoc);
      win0.document.close();
      // タイトル設定
      try { win0.document.title = title; } catch { /* cross-origin write block 防御 */ }
      // 2026-05-11 20:20:00 — afterprint で自動クローズ（about:blank が開きっぱなし問題対策）
      win0.addEventListener('afterprint', () => win0.close());
      setTimeout(() => win0.print(), 600);
      return;
    } else if ((currentLang === 'python' || currentLang === 'sql' || currentLang === 'ruby') && runner.lastResult) {
      bodyHtml = renderRunResultForPdf(runner.lastResult);
    } else {
      // ソースコード fallback（syntax highlight 付き）
      bodyHtml = `<pre class="code-block"><code class="language-${currentLang}">${highlightCode(code, currentLang)}</code></pre>`;
    }

    const printCss = `<style>
@page { margin: 16mm; }
body { font-family: 'Hiragino Sans', 'Yu Gothic UI', sans-serif; color: #222; line-height: 1.7; background: #fff; padding: 0; margin: 0; }
.doc-title { font-size: 16px; margin: 0 0 16px; color: #666; font-weight: 400; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
.doc-meta { font-size: 11px; color: #999; margin-bottom: 20px; }
pre.code-block { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 12px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; line-height: 1.5; overflow: auto; white-space: pre-wrap; word-break: break-word; }
.code-block code { font-family: inherit; color: #24292f; background: transparent; }
.code-block .token.keyword { color: #cf222e; font-weight: 600; }
.code-block .token.string { color: #0a3069; }
.code-block .token.comment { color: #6e7781; font-style: italic; }
.code-block .token.number { color: #0550ae; }
.code-block .token.function { color: #8250df; }
.code-block .token.punctuation { color: #24292f; }
.runner-stdout { font-family: 'JetBrains Mono', Consolas, monospace; background: #f6f8fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
.runner-stderr { font-family: 'JetBrains Mono', Consolas, monospace; background: #ffeef0; color: #82071e; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
.runner-table { border-collapse: collapse; margin: 8px 0; }
.runner-table th, .runner-table td { border: 1px solid #d0d7de; padding: 4px 8px; text-align: left; font-size: 12px; }
.runner-table th { background: #f6f8fa; font-weight: 600; }
.md-doc h1, .md-doc h2, .md-doc h3 { color: #24292f; }
.md-doc code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
.md-doc pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow: auto; }
.md-doc pre code { background: transparent; padding: 0; }
.md-doc blockquote { border-left: 4px solid #d0d7de; padding-left: 12px; color: #57606a; margin: 0 16px 16px 0; }
.md-doc table { border-collapse: collapse; }
.md-doc th, .md-doc td { border: 1px solid #d0d7de; padding: 6px 10px; }
img { max-width: 100%; }
h2 { font-size: 14px; margin: 16px 0 6px; color: #444; }
</style>`;

    const meta = `<div class="doc-meta">📄 ${escHtml(title)} — ${new Date().toLocaleString('ja-JP')}</div>`;
    const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${escHtml(title)}</title>${printCss}</head><body><h1 class="doc-title">${escHtml(title)}</h1>${meta}${bodyHtml}</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    // 2026-05-11 20:20:00 — afterprint で自動クローズ
    win.addEventListener('afterprint', () => win.close());
    setTimeout(() => win.print(), 500);
  }

  /** Runner 結果（stdout / stderr / artifacts）を PDF 用 HTML に変換 */
  function renderRunResultForPdf(result: RunResult): string {
    const parts: string[] = [];
    if (result.stdout) parts.push(`<h2>📺 標準出力</h2><pre class="runner-stdout">${escHtml(result.stdout)}</pre>`);
    // 2026-05-17 13:00:00 claude-opus-4-7[1m] セッションターン数：10 — ⚠️→📋（member 萎縮回避・stderr は学習対象なのでラベルは保持）
    if (result.stderr) parts.push(`<h2>📋 エラー出力</h2><pre class="runner-stderr">${escHtml(result.stderr)}</pre>`);
    if (result.artifacts) {
      for (const a of result.artifacts) {
        if (a.kind === 'table') {
          const head = a.columns.map((c) => `<th>${escHtml(c)}</th>`).join('');
          const rows = a.rows
            .map((r) => `<tr>${r.map((v) => `<td>${escHtml(String(v))}</td>`).join('')}</tr>`)
            .join('');
          parts.push(`<h2>🗄️ 結果テーブル</h2><table class="runner-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`);
        } else if (a.kind === 'image' && typeof a.data === 'string') {
          // base64 data URL inline
          parts.push(`<h2>🖼️ 画像</h2><img src="${a.data}" alt="image artifact" />`);
        }
      }
    }
    return parts.join('') || '<p>（出力なし）</p>';
  }

  /* ── 課題に提出フロー: kojinius 移植時に除去（公開ツール・バックエンド無し） ──
     2026-06-01 claude-opus-4-8[1m] セッションターン数：1 */

  /* ── MDコピー ── */
  // 2026-05-10 23:30:00 claude-opus-4-7[1m] セッションターン数：36 — state ベースに書換
  //   document.getElementById で textContent 直接操作していたが、ボタン文言が
  //   選択言語に応じて動的に変わるため React state 管理に変更。
  function copyMarkdown() {
    navigator.clipboard.writeText(textareaRef.current?.value ?? '').then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    });
  }

  /* ── キーボードショートカット ── */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = textareaRef.current!;
    // 2026-05-04 claude-sonnet-4-6 セッションターン数：6
    if (emojiPicker) {
      const total = filteredEmojis.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setEmojiPicker(p => p ? { ...p, idx: (p.idx + 1) % Math.max(total, 1) } : null); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setEmojiPicker(p => p ? { ...p, idx: (p.idx - 1 + Math.max(total, 1)) % Math.max(total, 1) } : null); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (filteredEmojis[emojiPicker.idx]) insertEmoji(filteredEmojis[emojiPicker.idx].e); return; }
      if (e.key === 'Escape')    { e.preventDefault(); setEmojiPicker(null); return; }
    }
    // 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13
    // Phase 14: 補完ピッカー操作（emoji picker と排他、emoji が開いてない時のみ反応）
    if (completion) {
      const totalC = filteredCompletions.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setCompletion(p => p ? { ...p, idx: (p.idx + 1) % Math.max(totalC, 1) } : null); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCompletion(p => p ? { ...p, idx: (p.idx - 1 + Math.max(totalC, 1)) % Math.max(totalC, 1) } : null); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (filteredCompletions[completion.idx]) insertCompletion(filteredCompletions[completion.idx]); return; }
      if (e.key === 'Escape')    { e.preventDefault(); setCompletion(null); return; }
    }
    // 2026-05-11 15:40:00 claude-opus-4-7[1m] セッションターン数：14
    // Phase 14: Alt+/ で補完ピッカー起動
    //   Ctrl+Space は Windows 日本語 IME が OS レベルで切替に消費するため使用不可（ボス実機確認 2026-05-11）。
    //   Alt+/ は IME 完全回避、VS Code 日本語環境の一般的代替キー。
    if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === '/' || e.code === 'Slash')) {
      e.preventDefault();
      const cur = ta.selectionStart;
      const wordMatch = ta.value.substring(0, cur).match(/[\w-]+$/);
      const prefix = wordMatch ? wordMatch[0] : '';
      const p = getCaretPixelPos(ta);
      const top = Math.max(10, Math.min(p.top, window.innerHeight - 340));
      const left = Math.max(10, Math.min(p.left, window.innerWidth - 380));
      setCompletion({ prefix, top, left, idx: 0 });
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); wrapSel('**', '**'); return; }
      if (e.key === 'i') { e.preventDefault(); wrapSel('*', '*'); return; }
      if (e.key === 'k') { e.preventDefault(); insertLink(); return; }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); saveToFile(e.shiftKey); return; }
      // 2026-05-11 [opus-4-7] Phase 6: Ctrl/Cmd + Enter で Runner 実行（Tier B+ のみ、Tier A は無視）
      // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: Ctrl/Cmd + Shift + Enter でトレース
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) void triggerTrace(); else void triggerRun();
        return;
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      ta.setRangeText('  ', ta.selectionStart, ta.selectionStart, 'end');
      handleInput();
      return;
    }
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
      const line = ta.value.substring(lineStart, s);
      const checkboxM = line.match(/^(\s*)(- \[[ x]\] )(.*)/);
      const bulletM   = line.match(/^(\s*)([-*] )(.*)/);
      const orderedM  = line.match(/^(\s*)(\d+)\. (.*)/);
      let prefix: string | null = null, isEmpty = false;
      if (checkboxM) { prefix = checkboxM[1] + '- [ ] '; isEmpty = checkboxM[3].trim() === ''; }
      else if (bulletM) { prefix = bulletM[1] + bulletM[2]; isEmpty = bulletM[3].trim() === ''; }
      else if (orderedM) { prefix = orderedM[1] + (parseInt(orderedM[2], 10) + 1) + '. '; isEmpty = orderedM[3].trim() === ''; }
      if (prefix !== null) {
        e.preventDefault();
        if (isEmpty) ta.setRangeText('', lineStart, s, 'end');
        else ta.setRangeText('\n' + prefix, s, s, 'end');
        handleInput();
      }
    }
  }

  /* ── ダイアログ操作 ── */
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：1
  // ファイルダイアログキャンセル時にタブが閉じられるバグを修正：saved が false なら doCloseTab をスキップ
  async function dlgSave() {
    if (closeDlgId !== null && activeId !== closeDlgId) switchTab(closeDlgId);
    const saved = await saveToFile(true);
    if (saved && closeDlgId !== null) doCloseTab(closeDlgId);
  }

  /* ── 絵文字フィルタ (2026-05-04 claude-sonnet-4-6 セッションターン数：6) ── */
  const filteredEmojis: EmojiEntry[] = emojiPicker
    ? (emojiPicker.query === '' ? EMOJIS.slice(0, 60) : EMOJIS.filter(({ k }) => k.toLowerCase().includes(emojiPicker.query.toLowerCase())).slice(0, 60))
    : [];

  // 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13
  // Phase 14: 補完候補（completion 開いている時のみ計算）
  const filteredCompletions: CompletionItem[] = completion
    ? getCompletions(currentLang, completion.prefix, { limit: 20 })
    : [];

  /** 2026-05-11 [opus-4-7] Phase 14: 選択中の補完候補をカーソル位置に挿入 */
  function insertCompletion(item: CompletionItem) {
    const ta = textareaRef.current;
    if (!ta) return;
    const cur = ta.selectionStart;
    const before = ta.value.substring(0, cur);
    const wordMatch = before.match(/[\w-]+$/);
    const start = wordMatch ? cur - wordMatch[0].length : cur;
    ta.setRangeText(item.keyword, start, cur, 'end');
    setCompletion(null);
    // textarea 値変更を反映させるため handleInput を呼ぶ
    handleInput();
  }

  /* ── 現在タブ情報（JSX 参照用、currentLang は useEffect 上で先に算出済み）── */
  const currentTab = tabs.find(t => t.id === activeId);

  /* ─────────────────────────────────────
     JSX
     ───────────────────────────────────── */
  return (
    <>
      <style>{`
        /* 2026-05-10 06:30:00 claude-opus-4-7[1m] — Phase 5 fix:
           Craftica dashboard 内に埋め込み時、100vh だと header(73px) + footer(88px)
           を越えて下部が画面外に。親（page.tsx の fixed wrapper）の 100% に従う形に。 */
        .md-shell { height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #1e1e2e; font-family: 'Inter', sans-serif; }
        .md-titlebar { background: #181825; padding: 10px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #313244; }
        .md-dot { width:12px; height:12px; border-radius:50%; }
        .md-file-menu-wrap { position: relative; }
        .md-file-btn { background:transparent; border:none; color:#a6adc8; font-size:13px; font-weight:600; font-family:inherit; padding:4px 10px; border-radius:6px; cursor:pointer; transition:all 0.15s; }
        .md-file-btn:hover, .md-file-btn.open { background:#313244; color:#cdd6f4; }
        .md-dropdown { display:none; position:absolute; top:calc(100% + 4px); left:0; background:#181825; border:1px solid #45475a; border-radius:8px; min-width:200px; box-shadow:0 8px 24px rgba(0,0,0,.5); z-index:999; padding:4px 0; }
        .md-dropdown.visible { display:block; }
        .md-ditem { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; color:#cdd6f4; font-size:13px; cursor:pointer; gap:16px; }
        .md-ditem:hover { background:#313244; }
        .md-ditem-key { color:#a6adc8; font-size:13px; font-family:monospace; }
        .md-dsep { height:1px; background:#313244; margin:4px 0; }
        .md-title-center { margin:0 auto; color:#cdd6f4; font-size:13px; font-weight:600; opacity:.7; }
        .md-toolbar { background:#181825; border-bottom:1px solid #313244; padding:8px 16px; display:flex; flex-wrap:wrap; align-items:center; gap:2px; flex-shrink:0; }
        .md-tb-group { display:flex; align-items:center; gap:1px; padding:0 8px; border-right:1px solid #313244; }
        .md-tb-group:last-of-type { border-right:none; }
        .md-tb-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; border-radius:7px; cursor:pointer; color:#a6adc8; font-size:13px; transition:all 0.15s; position:relative; }
        .md-tb-btn:hover { background:#313244; color:#cdd6f4; }
        .md-tb-btn.wide { width:auto; padding:0 10px; font-size:13px; font-weight:600; font-family:inherit; }
        .md-tb-btn[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:-28px; left:50%; transform:translateX(-50%); background:#11111b; color:#cdd6f4; font-size:13px; padding:3px 8px; border-radius:6px; white-space:nowrap; pointer-events:none; z-index:99; border:1px solid #313244; }
        .md-view-tabs { margin-left:auto; display:flex; gap:4px; }
        .md-view-tab { padding:5px 14px; border-radius:7px; border:none; background:transparent; cursor:pointer; color:#a6adc8; font-size:13px; font-weight:600; transition:all 0.15s; font-family:inherit; }
        .md-view-tab.active { background:linear-gradient(135deg,#a78bfa,#60a5fa); color:#fff; }
        .md-view-tab:not(.active):hover { background:#313244; color:#cdd6f4; }
        .md-tab-bar { background:#11111b; border-bottom:1px solid #313244; display:flex; align-items:flex-end; overflow-x:auto; padding:6px 8px 0; gap:2px; scrollbar-width:none; flex-shrink:0; }
        .md-tab-bar::-webkit-scrollbar { display:none; }
        .md-tab { display:flex; align-items:center; gap:6px; padding:6px 12px 6px 14px; background:#1a1a2e; border:1px solid #313244; border-bottom:none; border-radius:7px 7px 0 0; cursor:pointer; font-size:13px; color:#a6adc8; transition:background 0.12s, color 0.12s; max-width:180px; user-select:none; }
        .md-tab:hover { background:#252540; color:#a6adc8; }
        .md-tab.active { background:#1e1e2e; color:#cdd6f4; border-color:#45475a; border-bottom-color:#1e1e2e; z-index:1; }
        .md-tab-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:flex; align-items:center; gap:4px; }
        /* 2026-05-10 07:30:00 claude-opus-4-7[1m] — Phase 5 fix: タブ rename input */
        .md-tab-rename-input { background:#1e1e2e; border:1px solid #a78bfa; border-radius:4px; color:#cdd6f4; font-family:inherit; font-size:13px; padding:2px 6px; outline:none; width:130px; box-shadow:0 0 0 2px rgba(167,139,250,.25); }
        .md-tab-name span[ondblclick], .md-tab-name span[title] { cursor:text; }
        .md-tab-dirty { color:#f9e2af; font-size:13px; }
        .md-tab-close { flex-shrink:0; width:18px; height:18px; border:none; background:transparent; color:#45475a; font-size:14px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.1s; padding:0; }
        .md-tab-close:hover { background:#f38ba822; color:#f38ba8; }
        .md-tab-add { flex-shrink:0; width:28px; height:28px; border:1px dashed #313244; background:transparent; border-radius:7px; cursor:pointer; color:#45475a; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all 0.12s; margin-bottom:1px; margin-left:2px; }
        .md-tab-add:hover { border-color:#a78bfa; color:#a78bfa; background:#a78bfa11; }
        .md-panels { display:flex; flex:1; overflow:hidden; }
        .md-panel { flex:1; display:flex; flex-direction:column; min-width:0; }
        .md-panel.hidden { display:none; }
        /* 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — 翻訳ペイン */
        .md-translate-body { flex:1; overflow:auto; padding:16px 20px; min-height:0; }
        .md-translate-output { color:#cdd6f4; font-size:14px; line-height:1.85; white-space:pre-wrap; word-break:break-word; }
        .md-translate-toggle { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#a6adc8; cursor:pointer; user-select:none; text-transform:none; letter-spacing:0; }
        .md-translate-toggle input { accent-color:#a78bfa; cursor:pointer; width:14px; height:14px; }
        .md-translate-now-btn { background:linear-gradient(135deg,#a78bfa,#60a5fa); color:#fff; border:none; padding:4px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; text-transform:none; letter-spacing:0; }
        .md-translate-now-btn:hover { filter:brightness(1.08); }
        .md-translate-spinner { color:#a6adc8; font-size:13px; }
        /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
        /* 分割中央のリサイズハンドル */
        .md-resizer { width:6px; flex-shrink:0; background:#313244; cursor:col-resize; transition:background .15s; position:relative; }
        .md-resizer:hover { background:#45475a; }
        .md-resizer.dragging { background:#a78bfa; }
        .md-resizer::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:2px; height:32px; background:#a6adc8; border-radius:1px; opacity:.5; }
        .md-resizer:hover::after,.md-resizer.dragging::after { opacity:1; background:#cdd6f4; }
        .md-panel-header { padding:8px 20px; background:#181825; border-bottom:1px solid #313244; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#a6adc8; display:flex; align-items:center; gap:6px; position:relative; }
        /* 2026-05-10 08:00:00 claude-opus-4-7[1m] — Phase 5 fix: 言語ピッカー（panel header クリックで開く） */
        .md-lang-picker-trigger { background:transparent; border:none; color:inherit; font-family:inherit; font-size:inherit; font-weight:inherit; letter-spacing:inherit; text-transform:inherit; cursor:pointer; padding:4px 10px; margin:-4px 0; display:inline-flex; align-items:center; gap:6px; border-radius:6px; transition:background .15s,color .15s; }
        .md-lang-picker-trigger:hover { background:#313244; color:#cdd6f4; }
        .md-lang-picker-trigger[aria-expanded="true"] { background:#313244; color:#cba6f7; }
        .md-lang-picker-chevron { font-size:13px; opacity:.6; transition:opacity .15s; }
        .md-lang-picker-trigger:hover .md-lang-picker-chevron { opacity:1; }
        .md-lang-picker-dropdown { position:absolute; top:calc(100% + 4px); left:16px; background:#1e1e2e; border:1px solid #45475a; border-radius:12px; padding:6px; box-shadow:0 12px 32px rgba(0,0,0,.6); z-index:200; min-width:240px; max-height:380px; overflow-y:auto; animation:md-lang-picker-fade .15s ease-out; }
        @keyframes md-lang-picker-fade { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .md-lang-picker-heading { padding:8px 12px 6px; font-size:13px; font-weight:700; color:#a6adc8; letter-spacing:.5px; text-transform:none; }
        .md-lang-picker-item { display:flex; align-items:center; gap:10px; width:100%; padding:8px 12px; background:transparent; border:none; color:#cdd6f4; font-family:inherit; font-size:13px; font-weight:500; letter-spacing:0; text-transform:none; cursor:pointer; border-radius:8px; text-align:left; transition:background .12s; }
        .md-lang-picker-item:hover { background:#313244; }
        .md-lang-picker-item-active { background:rgba(167,139,250,.15); color:#cba6f7; font-weight:700; }
        .md-lang-picker-item-active:hover { background:rgba(167,139,250,.25); }
        /* 2026-05-10 11:00:00 — キーボード選択中の hover ハイライト（mouse hover と同じ） */
        .md-lang-picker-item-focused { background:#45475a; color:#fff; }
        .md-lang-picker-item-active.md-lang-picker-item-focused { background:rgba(167,139,250,.35); color:#fff; }
        .md-lang-picker-hint { font-size:13px; color:#a6adc8; font-weight:500; margin-left:6px; letter-spacing:0; text-transform:none; }
        .md-lang-picker-emoji { font-size:18px; flex-shrink:0; line-height:1; }
        .md-lang-picker-label { flex:1; }
        .md-lang-picker-check { color:#a6e3a1; font-weight:700; flex-shrink:0; }
        /* 2026-05-10 23:30:00 claude-opus-4-7[1m] セッションターン数：36 — 課題コンテキスト時の onboarding 吹き出し（5s 自動消去 + バウンド） */
        /* 2026-05-11 00:50:00 claude-opus-4-7[1m] セッションターン数：40 — bounce 効かないバグ修正
           旧: animation:bounce, fade-in の 2 並列。後段 fade-in が transform を支配 → bounce 不発。
           新: 1 つの animation にまとめ、最初 200ms で fade-in（opacity + 軽い slide-down）、
               以降は bounce ループのみ（transform は keyframe で連続制御） */
        .md-lang-onboarding-chip { position:absolute; top:calc(100% + 10px); left:0; background:linear-gradient(135deg,#a78bfa 0%,#cba6f7 100%); color:#fff; padding:7px 14px; border-radius:10px; font-size:13px; font-weight:700; white-space:nowrap; box-shadow:0 6px 18px rgba(167,139,250,.45); pointer-events:none; z-index:150; letter-spacing:.02em; opacity:0; animation: md-onboarding-fade-bounce 5000ms cubic-bezier(.4,0,.2,1) forwards; }
        .md-lang-onboarding-chip::before { content:''; position:absolute; top:-5px; left:18px; width:10px; height:10px; background:#a78bfa; transform:rotate(45deg); }
        /* 5 秒間で fade-in → bounce 5 往復 → fade-out（5 秒で表示消失）。1 つの keyframe で transform 競合を完全回避。 */
        @keyframes md-onboarding-fade-bounce {
          0%   { opacity:0; transform:translateY(-6px); }
          4%   { opacity:1; transform:translateY(0); }
          /* bounce 5 往復（4-100% を 5 等分し、各区間で -5px → 0px）*/
          14%  { transform:translateY(-5px); }
          24%  { transform:translateY(0); }
          34%  { transform:translateY(-5px); }
          44%  { transform:translateY(0); }
          54%  { transform:translateY(-5px); }
          64%  { transform:translateY(0); }
          74%  { transform:translateY(-5px); }
          84%  { transform:translateY(0); }
          92%  { transform:translateY(-5px); }
          96%  { opacity:1; transform:translateY(0); }
          100% { opacity:0; transform:translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .md-lang-onboarding-chip {
            animation: md-onboarding-static-fade 5000ms ease-out forwards;
          }
          @keyframes md-onboarding-static-fade {
            0% { opacity:0; }
            5% { opacity:1; }
            95% { opacity:1; }
            100% { opacity:0; }
          }
        }
        /* 2026-05-10 23:50:00 claude-opus-4-7[1m] セッションターン数：37 — ショトカ kbd 表示（共通） */
        .md-shortcut-kbd { display:inline-flex; align-items:center; padding:2px 6px; font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:600; line-height:1; color:rgba(255,255,255,0.75); background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18); border-radius:4px; margin-left:6px; letter-spacing:.02em; white-space:nowrap; }
        .md-shortcut-kbd-subtle { color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }
        .md-shortcut-kbd-onbtn { color:rgba(30,30,46,0.75); background:rgba(30,30,46,0.12); border-color:rgba(30,30,46,0.22); }
        /* 2026-05-11 00:10:00 claude-opus-4-7[1m] セッションターン数：38 — Phase E3 提出ボタン + モーダル */
        /* 2026-06-02 claude-opus-4-8[1m] セッションターン数：5 — review fix: 課題提出フロー除去に伴い submit 系 CSS を削除 */
        .md-dot-ind { width:6px; height:6px; border-radius:50%; }
        /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
        /* リサイザがセパレータ役なので border-right は分割時のみ無効化 */
        #md-panel-editor:not(.split) { border-right:1px solid #313244; }
        #md-panel-editor .md-dot-ind { background:#a78bfa; }
        #md-panel-preview .md-dot-ind { background:#60a5fa; }
        .md-editor-wrap { display:flex; flex:1; overflow:hidden; }
        #md-linenums { background:#181825; color:#45475a; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.8; padding:24px 12px 24px 16px; text-align:right; border-right:1px solid #313244; min-width:52px; overflow:hidden; user-select:none; white-space:pre; }
        /* 2026-05-10 04:00:00 claude-opus-4-7[1m] — Phase 1-3: textarea + Prism overlay */
        /* text-stack: オーバーレイを効かせるための position: relative コンテナ */
        .md-text-stack { flex:1; position:relative; overflow:hidden; min-width:0; min-height:0; background:#1e1e2e; }
        /* Prism ハイライト overlay。textarea と同じスタイルで文字配置を一致 */
        .md-highlight-overlay { position:absolute; inset:0; margin:0; padding:24px 28px; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.8; white-space:pre-wrap; word-wrap:break-word; word-break:break-word; color:#cdd6f4; pointer-events:none; overflow:hidden; background:transparent; tab-size:2; box-sizing:border-box; }
        .md-highlight-overlay code { font-family:inherit; font-size:inherit; line-height:inherit; white-space:inherit; background:transparent; display:block; padding:0; color:inherit; }
        /* textarea は透明、caret のみ表示 */
        #md-textarea { position:absolute; inset:0; width:100%; height:100%; background:transparent; color:transparent; caret-color:#cdd6f4; border:none; outline:none; resize:none; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.8; padding:24px 28px; tab-size:2; white-space:pre-wrap; word-wrap:break-word; word-break:break-word; box-sizing:border-box; z-index:1; }
        #md-textarea::placeholder { color:#45475a; }
        #md-textarea::-webkit-scrollbar { width:6px; }
        #md-textarea::-webkit-scrollbar-track { background:#1e1e2e; }
        #md-textarea::-webkit-scrollbar-thumb { background:#45475a; border-radius:3px; }
        /* 選択ハイライトを少し見えるように調整 */
        #md-textarea::selection { background:rgba(167,139,250,.35); color:transparent; }
        /* Prism token カラー（既存 .craftica-editor-prism と統一、Catppuccin Mocha 風）*/
        .md-highlight-overlay .token.comment,
        .md-highlight-overlay .token.prolog,
        .md-highlight-overlay .token.doctype,
        .md-highlight-overlay .token.cdata { color:#a6adc8; font-style:italic; }
        .md-highlight-overlay .token.punctuation { color:#a6adc8; }
        .md-highlight-overlay .token.namespace { opacity:.7; }
        .md-highlight-overlay .token.property,
        .md-highlight-overlay .token.tag,
        .md-highlight-overlay .token.boolean,
        .md-highlight-overlay .token.number,
        .md-highlight-overlay .token.constant,
        .md-highlight-overlay .token.symbol,
        .md-highlight-overlay .token.deleted { color:#f38ba8; }
        .md-highlight-overlay .token.selector,
        .md-highlight-overlay .token.attr-name,
        .md-highlight-overlay .token.string,
        .md-highlight-overlay .token.char,
        .md-highlight-overlay .token.builtin,
        .md-highlight-overlay .token.inserted { color:#a6e3a1; }
        .md-highlight-overlay .token.operator,
        .md-highlight-overlay .token.entity,
        .md-highlight-overlay .token.url,
        .md-highlight-overlay .language-css .token.string,
        .md-highlight-overlay .style .token.string { color:#94e2d5; }
        .md-highlight-overlay .token.atrule,
        .md-highlight-overlay .token.attr-value,
        .md-highlight-overlay .token.keyword { color:#cba6f7; }
        .md-highlight-overlay .token.function,
        .md-highlight-overlay .token.class-name { color:#89b4fa; }
        .md-highlight-overlay .token.regex,
        .md-highlight-overlay .token.important,
        .md-highlight-overlay .token.variable { color:#f9e2af; }
        .md-highlight-overlay .token.bold { font-weight:700; }
        .md-highlight-overlay .token.italic { font-style:italic; }
        /* プレビュー対象外表示（Python/SQL/YAML 等）*/
        .md-no-preview { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1e1e2e; color:#a6adc8; text-align:center; padding:32px; gap:8px; }
        .md-no-preview strong { color:#cdd6f4; font-size:14px; }
        .md-no-preview p { margin:0; font-size:13px; line-height:1.6; }
        /* 2026-05-10 05:00:00 claude-opus-4-7[1m] — Phase 4: 視覚過敏配慮 */
        .md-reduced-motion *,
        .md-reduced-motion *::before,
        .md-reduced-motion *::after {
          transition-duration: 0ms !important;
          animation-duration: 0ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
        /* Phase 4: course 文脈バッジ（コース内で開かれている時にタイトルバー表示）*/
        .md-course-badge { display:inline-flex; align-items:center; gap:4px; margin-right:10px; padding:2px 10px; background:#a78bfa22; color:#cba6f7; border-radius:6px; font-size:13px; font-weight:700; letter-spacing:.3px; white-space:nowrap; max-width:240px; overflow:hidden; text-overflow:ellipsis; }
        /* 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: 学習バー（カーソル位置のキーワード解説）*/
        /* 2026-05-10 07:00:00 claude-opus-4-7[1m] — fix: bar 全体クリック可能化 + 短文の隣に CTA 配置 */
        .md-lesson-bar { background:linear-gradient(90deg,#181825 0%,#1e1e2e 50%,#181825 100%); border-top:1px solid #313244; padding:8px 20px; display:flex; align-items:center; gap:10px; font-size:13px; color:#a6adc8; flex-shrink:0; min-height:44px; transition:background .25s,color .25s,border-top-color .25s; flex-wrap:wrap; outline:none; }
        .md-lesson-bar-active { background:linear-gradient(90deg,#181825 0%,#2a1f4a 50%,#181825 100%); color:#cdd6f4; border-top-color:#45475a; }
        .md-lesson-bar-clickable { cursor:pointer; user-select:none; }
        .md-lesson-bar-clickable:hover { background:linear-gradient(90deg,#1f1d2e 0%,#3a2f5a 50%,#1f1d2e 100%); }
        .md-lesson-bar-clickable:focus-visible { box-shadow:inset 0 0 0 2px #a78bfa; }
        .md-lesson-emoji { font-size:18px; flex-shrink:0; line-height:1; }
        .md-lesson-keyword { color:#cba6f7; font-weight:700; font-family:'JetBrains Mono',monospace; padding:3px 10px; background:#313244; border:1px solid #45475a; border-radius:6px; font-size:13px; flex-shrink:0; }
        .md-lesson-arrow { color:#a6adc8; flex-shrink:0; }
        .md-lesson-short { color:#cdd6f4; min-width:0; line-height:1.5; }
        /* CTA は短文の直後に並べて見つけやすく。bar 全体クリックでも開けるが、視覚的にも目立たせる */
        .md-lesson-detail-cta { background:linear-gradient(135deg,#a78bfa 0%,#cba6f7 100%); color:#fff; padding:5px 12px; border-radius:7px; font-size:13px; font-weight:700; flex-shrink:0; box-shadow:0 2px 6px rgba(167,139,250,.3); white-space:nowrap; transition:transform .15s,box-shadow .15s; pointer-events:none; }
        .md-lesson-bar-clickable:hover .md-lesson-detail-cta { transform:translateY(-1px); box-shadow:0 4px 12px rgba(167,139,250,.5); }
        .md-lesson-hint { color:#a6adc8; font-style:italic; font-size:13px; }
        /* Phase 5: 学習詳細 popup */
        .md-lesson-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:9000; display:flex; align-items:center; justify-content:center; padding:24px; animation:md-lesson-fade-in .18s ease-out; }
        @keyframes md-lesson-fade-in { from { opacity:0; } to { opacity:1; } }
        .md-lesson-popup { background:linear-gradient(180deg,#1e1e2e 0%,#181825 100%); border:1px solid #45475a; border-radius:18px; padding:24px 28px; max-width:560px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.7),0 0 0 1px rgba(167,139,250,.1); display:flex; flex-direction:column; gap:16px; animation:md-lesson-pop-in .22s cubic-bezier(.34,1.56,.64,1); }
        @keyframes md-lesson-pop-in { from { opacity:0; transform:scale(.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .md-lesson-popup-header { display:flex; align-items:center; gap:14px; }
        .md-lesson-emoji-large { font-size:36px; flex-shrink:0; line-height:1; }
        .md-lesson-popup-title { color:#cba6f7; font-size:18px; font-weight:700; font-family:'JetBrains Mono',monospace; flex:1; padding:4px 12px; background:#313244; border-radius:8px; word-break:break-all; }
        .md-lesson-close { background:transparent; border:1px solid #313244; color:#a6adc8; font-size:22px; font-family:inherit; cursor:pointer; width:36px; height:36px; border-radius:10px; flex-shrink:0; transition:background .15s,color .15s,border-color .15s; display:flex; align-items:center; justify-content:center; padding:0; }
        .md-lesson-close:hover { background:#f38ba822; color:#f38ba8; border-color:#f38ba844; }
        .md-lesson-popup-detail { color:#cdd6f4; font-size:14px; line-height:1.8; margin:0; }
        .md-lesson-popup-example-wrap { display:flex; flex-direction:column; gap:6px; }
        /* 2026-05-10 07:00:00 claude-opus-4-7[1m] — fix: ラベルとコピーボタンを横並び */
        .md-lesson-popup-example-label { font-size:13px; font-weight:700; color:#a6e3a1; letter-spacing:.5px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .md-lesson-copy-btn { background:#313244; color:#cdd6f4; border:1px solid #45475a; padding:4px 12px; border-radius:6px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:background .15s,color .15s,border-color .15s; }
        .md-lesson-copy-btn:hover { background:#45475a; color:#fff; border-color:#a78bfa; }
        .md-lesson-copy-btn-done { background:#a6e3a122; color:#a6e3a1; border-color:#a6e3a166; }
        .md-lesson-copy-btn-done:hover { background:#a6e3a122; color:#a6e3a1; border-color:#a6e3a1; }
        .md-lesson-popup-example { background:#11111b; border:1px solid #313244; border-radius:10px; padding:14px 16px; margin:0; overflow-x:auto; font-size:13px; }
        .md-lesson-popup-example code { font-family:'JetBrains Mono',monospace; color:#a6e3a1; white-space:pre; }
        .md-lesson-popup-footer { border-top:1px solid #313244; padding-top:12px; display:flex; justify-content:center; }
        .md-lesson-popup-tip { color:#a6adc8; font-size:13px; font-style:italic; }
        #md-preview-pane { flex:1; background:#1e1e2e; padding:24px 32px; overflow-y:auto; color:#cdd6f4; font-size:15px; line-height:1.85; }
        #md-preview-pane::-webkit-scrollbar { width:6px; }
        #md-preview-pane::-webkit-scrollbar-track { background:#1e1e2e; }
        #md-preview-pane::-webkit-scrollbar-thumb { background:#45475a; border-radius:3px; }
        #md-preview-pane h1,#md-preview-pane h2,#md-preview-pane h3,#md-preview-pane h4,#md-preview-pane h5,#md-preview-pane h6 { color:#cba6f7; margin:1.2em 0 .5em; font-weight:700; }
        #md-preview-pane h1 { font-size:2em; border-bottom:2px solid #313244; padding-bottom:.3em; }
        #md-preview-pane h2 { font-size:1.5em; border-bottom:1px solid #313244; padding-bottom:.2em; }
        #md-preview-pane h3 { font-size:1.2em; }
        #md-preview-pane p { margin:.7em 0; }
        #md-preview-pane strong { color:#f5c2e7; font-weight:700; }
        #md-preview-pane em { color:#94e2d5; font-style:italic; }
        #md-preview-pane a { color:#89b4fa; text-decoration:underline; }
        #md-preview-pane code { background:#313244; color:#f38ba8; padding:2px 6px; border-radius:5px; font-family:'JetBrains Mono',monospace; font-size:.88em; }
        #md-preview-pane pre { background:#11111b; border:1px solid #313244; border-radius:10px; padding:16px 20px; overflow-x:auto; margin:1em 0; }
        #md-preview-pane pre code { background:transparent; color:#a6e3a1; padding:0; font-size:.9em; line-height:1.7; }
        #md-preview-pane blockquote { border-left:3px solid #a78bfa; margin:1em 0; padding:8px 16px; background:#181825; border-radius:0 8px 8px 0; color:#a6adc8; font-style:italic; }
        /* 2026-05-04 claude-sonnet-4-6 セッションターン数：5 Tailwind preflight が list-style:none をグローバル注入するため明示復元。ネスト階層ごとにマーカーを設定 */
        #md-preview-pane ul { padding-left:1.5em; margin:.7em 0; list-style:disc; }
        #md-preview-pane ul ul { list-style:circle; }
        #md-preview-pane ul ul ul { list-style:square; }
        #md-preview-pane ol { padding-left:1.5em; margin:.7em 0; list-style:decimal; }
        #md-preview-pane li { margin:.3em 0; }
        #md-preview-pane li:has(> input[type="checkbox"]) { list-style:none; }
        #md-preview-pane table { border-collapse:collapse; width:100%; margin:1em 0; }
        #md-preview-pane th { background:#313244; color:#cba6f7; padding:8px 14px; text-align:left; border:1px solid #45475a; font-size:13px; }
        #md-preview-pane td { padding:7px 14px; border:1px solid #313244; font-size:14px; }
        #md-preview-pane tr:nth-child(even) td { background:#181825; }
        #md-preview-pane img { max-width:100%; border-radius:8px; margin:.5em 0; }
        #md-preview-pane hr { border:none; border-top:1px solid #313244; margin:1.5em 0; }
        .md-callout { display:flex; align-items:flex-start; gap:10px; background:#313244; border:1px solid #45475a; border-radius:8px; padding:14px 16px; margin:12px 0; }
        .md-callout > span { font-size:20px; flex-shrink:0; line-height:1.4; }
        .md-callout > div { flex:1; color:#cdd6f4; font-size:14px; }
        .md-statusbar { background:#181825; border-top:1px solid #313244; padding:6px 20px; display:flex; align-items:center; gap:16px; font-size:13px; color:#a6adc8; flex-shrink:0; }
        .md-statusbar span { display:flex; align-items:center; gap:4px; }
        .md-sep { color:#313244 !important; }
        .md-status-btn { padding:4px 12px; border-radius:6px; border:1px solid #313244; background:transparent; color:#a6adc8; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        #md-btn-copy { margin-left:auto; }
        .md-status-btn:hover { background:#313244; color:#cdd6f4; }
        #md-btn-save { border-color:#a78bfa; color:#a78bfa; }
        #md-btn-save:hover { background:#a78bfa22; color:#cba6f7; }
.md-overlay { display:flex; position:fixed; inset:0; z-index:8888; background:rgba(0,0,0,.65); align-items:center; justify-content:center; }
        .md-dialog-box { background:#1e1e2e; border:1px solid #45475a; border-radius:14px; padding:28px 32px; min-width:340px; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.6); display:flex; flex-direction:column; gap:20px; }
        .md-dialog-box h3 { color:#f9e2af; font-size:15px; font-weight:700; }
        .md-dialog-box p { color:#a6adc8; font-size:13px; line-height:1.6; }
        .md-dialog-box p strong { color:#cdd6f4; }
        .md-dialog-actions { display:flex; gap:8px; justify-content:flex-end; }
        /* 2026-05-04 claude-sonnet-4-6 セッションターン数：1 */
        .md-dialog-actions button { padding:8px 18px; border-radius:8px; border:1px solid #313244; background:transparent; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:all 0.12s; color:#a6adc8; white-space:nowrap; }
        .md-dialog-actions button:hover { background:#313244; color:#cdd6f4; }
        .md-btn-save-dlg { background:linear-gradient(135deg,#a78bfa,#60a5fa) !important; border-color:transparent !important; color:#fff !important; }
        .md-btn-save-dlg:hover { opacity:.88; }
        .md-btn-discard { border-color:#f38ba844 !important; color:#f38ba8 !important; }
        .md-btn-discard:hover { background:#f38ba811 !important; }
      `}</style>

      {/* 2026-05-10 05:00:00 claude-opus-4-7[1m] — Phase 4: reducedMotion 反映 */}
      <div className={`md-shell${reducedMotion ? ' md-reduced-motion' : ''}`} onDragOver={handleDragOver} onDrop={handleDrop}>
        {/* タイトルバー */}
        <div className="md-titlebar">
          <span className="md-dot" style={{ background: '#f38ba8' }} />
          <span className="md-dot" style={{ background: '#f9e2af' }} />
          <span className="md-dot" style={{ background: '#a6e3a1' }} />
          <div className="md-file-menu-wrap">
            <button className={`md-file-btn${fileMenu ? ' open' : ''}`} onClick={() => setFileMenu(v => !v)}>ファイル(F)</button>
            <div className={`md-dropdown${fileMenu ? ' visible' : ''}`}>
              <div className="md-ditem" onClick={() => { setFileMenu(false); openFile(); }}>
                <span>📂 開く</span><span className="md-ditem-key">Alt+O</span>
              </div>
              <div className="md-dsep" />
              <div className="md-ditem" onClick={() => { setFileMenu(false); saveToFile(true); }}>
                <span>💾 名前を付けて保存</span><span className="md-ditem-key">A</span>
              </div>
              <div className="md-dsep" />
              <div className="md-ditem" onClick={() => { setFileMenu(false); copyMarkdown(); }}>
                <span>📋 {LANG_SHORT_LABEL[currentLang]}をコピー</span><span className="md-ditem-key">C</span>
              </div>
            </div>
          </div>
          {/* 2026-05-10 05:00:00 claude-opus-4-7[1m] — Phase 4: course 文脈バッジ */}
          <span className="md-title-center">
            {course && <span className="md-course-badge" title={course.title}>📚 {course.title}</span>}
            📄 {currentTab?.name ?? 'untitled.md'}
          </span>
        </div>

        {/* ツールバー */}
        <div className="md-toolbar">
          <div className="md-tb-group">
            <button className="md-tb-btn wide" data-tip="見出し1" onClick={() => insert('# ')}>H1</button>
            <button className="md-tb-btn wide" data-tip="見出し2" onClick={() => insert('## ')}>H2</button>
            <button className="md-tb-btn wide" data-tip="見出し3" onClick={() => insert('### ')}>H3</button>
          </div>
          <div className="md-tb-group">
            <button className="md-tb-btn" data-tip="太字 (Ctrl+B)" onClick={() => wrapSel('**', '**')}><b>B</b></button>
            <button className="md-tb-btn" data-tip="斜体 (Ctrl+I)" onClick={() => wrapSel('*', '*')}><i>I</i></button>
            <button className="md-tb-btn" data-tip="打ち消し線" onClick={() => wrapSel('~~', '~~')}><s>S</s></button>
            <button className="md-tb-btn" data-tip="インラインコード" onClick={() => wrapSel('`', '`')}>⌨</button>
          </div>
          <div className="md-tb-group">
            <button className="md-tb-btn" data-tip="リンク" onClick={insertLink}>🔗</button>
            <button className="md-tb-btn" data-tip="画像" onClick={insertImage}>🖼</button>
            <button className="md-tb-btn" data-tip="引用" onClick={() => insert('> ')}>❝</button>
            <button className="md-tb-btn" data-tip="水平線" onClick={insertHR}>—</button>
          </div>
          <div className="md-tb-group">
            <button className="md-tb-btn" data-tip="箇条書き" onClick={() => insert('- ')}>≡</button>
            <button className="md-tb-btn" data-tip="番号付きリスト" onClick={() => insert('1. ')}>①</button>
            <button className="md-tb-btn" data-tip="チェックリスト" onClick={() => insert('- [ ] ')}>☑</button>
          </div>
          <div className="md-tb-group">
            <button className="md-tb-btn" data-tip="コードブロック" onClick={insertCode}>⌦</button>
            <button className="md-tb-btn" data-tip="テーブル" onClick={insertTable}>⊞</button>
            {/* 2026-05-04 claude-sonnet-4-6 セッションターン数：5 */}
            <button className="md-tb-btn" data-tip="コールアウト" onClick={insertCallout}>📝</button>
          </div>
          {/* 2026-05-11 16:30:00 claude-opus-4-7[1m] セッションターン数：16 — ペイン切替にショートカット表示 */}
          <div className="md-view-tabs">
            <button className={`md-view-tab${view === 'split' ? ' active' : ''}`} onClick={() => setView('split')} title="分割表示 (Alt+1)">
              分割 <kbd className={`md-shortcut-kbd ${view === 'split' ? 'md-shortcut-kbd-onbtn' : 'md-shortcut-kbd-subtle'}`}>Alt+1</kbd>
            </button>
            <button className={`md-view-tab${view === 'editor' ? ' active' : ''}`} onClick={() => setView('editor')} title="編集のみ (Alt+2)">
              編集 <kbd className={`md-shortcut-kbd ${view === 'editor' ? 'md-shortcut-kbd-onbtn' : 'md-shortcut-kbd-subtle'}`}>Alt+2</kbd>
            </button>
            <button className={`md-view-tab${view === 'preview' ? ' active' : ''}`} onClick={() => setView('preview')} title="プレビューのみ (Alt+3)">
              プレビュー <kbd className={`md-shortcut-kbd ${view === 'preview' ? 'md-shortcut-kbd-onbtn' : 'md-shortcut-kbd-subtle'}`}>Alt+3</kbd>
            </button>
            {/* 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — 🌐 翻訳ビュー（日→英・オンデバイス） */}
            <button className={`md-view-tab${view === 'translate' ? ' active' : ''}`} onClick={() => setView('translate')} title="日本語→英語 翻訳 (Alt+4)">
              🌐 翻訳 <kbd className={`md-shortcut-kbd ${view === 'translate' ? 'md-shortcut-kbd-onbtn' : 'md-shortcut-kbd-subtle'}`}>Alt+4</kbd>
            </button>
          </div>
          {/* 2026-06-01 claude-opus-4-8[1m] セッションターン数：1 — kojinius 移植: 課題提出ボタン除去 */}
        </div>

        {/* タブバー */}
        <div className="md-tab-bar">
          {tabs.map(tab => (
            <div key={tab.id} className={`md-tab${tab.id === activeId ? ' active' : ''}`} onClick={() => switchTab(tab.id)}>
              <span className="md-tab-name">
                {!tab.saved && <span className="md-tab-dirty">●</span>}
                {/* 2026-05-10 07:30:00 claude-opus-4-7[1m] — Phase 5 fix: タブ rename */}
                {renamingTabId === tab.id ? (
                  <input
                    className="md-tab-rename-input"
                    value={renameInput}
                    autoFocus
                    onChange={(e) => setRenameInput(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                      else if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => { e.stopPropagation(); startRename(tab.id); }}
                    title="ダブルクリックで名前を変更（拡張子で言語が決まるよ）"
                    dangerouslySetInnerHTML={{ __html: escHtml(tab.name) }}
                  />
                )}
              </span>
              <button className="md-tab-close" onClick={e => requestCloseTab(tab.id, e)}>×</button>
            </div>
          ))}
          <button className="md-tab-add" onClick={createTab}>＋</button>
        </div>

        {/* パネル */}
        {/* 2026-05-05 claude-opus-4-7 セッションターン数：2 */}
        {/* 分割時は splitRatio で幅制御、それ以外は flex:1 */}
        {/* 2026-05-11 19:00:00 claude-opus-4-7[1m] セッションターン数：23
            fix: ドラッグ中の「ガックガク」解消のため CSS 変数 --split-ratio 経由で
            幅制御。ドラッグ中は panelsRef.style.setProperty で直接更新し
            React 再 render を完全回避（drop 時に setSplitRatio で同期）。 */}
        <div
          className="md-panels"
          ref={panelsRef}
          style={{ ['--split-ratio' as string]: splitRatio }}
        >
          <div
            id="md-panel-editor"
            className={`md-panel${view === 'preview' ? ' hidden' : ''}${view === 'split' || view === 'translate' ? ' split' : ''}`}
            style={view === 'split' || view === 'translate' ? { flex: '0 0 calc(var(--split-ratio) * 100% - 3px)' } : undefined}
          >
            {/* 2026-05-10 04:00:00 claude-opus-4-7[1m] — 言語ラベルを動的表示 */}
            {/* 2026-05-10 08:00:00 claude-opus-4-7[1m] — Phase 5 fix: クリックで言語ピッカー */}
            <div className="md-panel-header">
              <span className="md-dot-ind" />
              {/* 2026-05-10 23:30:00 claude-opus-4-7[1m] セッションターン数：36
                  課題からエディタ起動直後 5 秒間、言語選択プルダウンに onboarding 吹き出しを表示。
                  trigger を relative wrapper で囲んで吹き出しを absolute 配置。 */}
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  type="button"
                  className="md-lang-picker-trigger"
                  onClick={(e) => { e.stopPropagation(); setLangPickerOpen(v => !v); setShowLangOnboardingChip(false); }}
                  title="クリックで言語を切り替え (Alt+L)"
                  aria-haspopup="listbox"
                  aria-expanded={langPickerOpen}
                >
                  <span>{LANG_LABEL[currentLang]}</span>
                  {/* 2026-05-10 23:50:00 claude-opus-4-7[1m] セッションターン数：37 — Alt+L kbd 表示（既に keybinding 実装済） */}
                  <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Alt+L</kbd>
                  <span className="md-lang-picker-chevron" aria-hidden="true">{langPickerOpen ? '▲' : '▼'}</span>
                </button>
                {course && showLangOnboardingChip && (
                  <div className="md-lang-onboarding-chip" role="tooltip">
                    👇 ここで提出するコードを選んでね
                  </div>
                )}
              </span>
              {langPickerOpen && (
                <div className="md-lang-picker-dropdown" role="listbox">
                  <div className="md-lang-picker-heading">何を書く？ <span className="md-lang-picker-hint">↑↓ 選択 / Enter 決定 / Esc 閉じる</span></div>
                  {LANG_PICKER_OPTIONS.map(({ lang, emoji, label }, i) => (
                    <button
                      key={lang}
                      ref={(el) => { langPickerItemRefs.current[i] = el; }}
                      type="button"
                      className={`md-lang-picker-item${lang === currentLang ? ' md-lang-picker-item-active' : ''}${i === langPickerIdx ? ' md-lang-picker-item-focused' : ''}`}
                      onClick={(e) => { e.stopPropagation(); pickLanguage(lang); }}
                      onMouseEnter={() => setLangPickerIdx(i)}
                      role="option"
                      aria-selected={lang === currentLang}
                    >
                      <span className="md-lang-picker-emoji" aria-hidden="true">{emoji}</span>
                      <span className="md-lang-picker-label">{label}</span>
                      {lang === currentLang && <span className="md-lang-picker-check" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="md-editor-wrap">
              <div id="md-linenums" ref={lineNumRef} aria-hidden="true">1</div>
              {/* 2026-05-10 04:00:00 claude-opus-4-7[1m] — Phase 1-3: textarea + Prism overlay */}
              {/* overlay は aria-hidden、視覚的にハイライト表示。textarea は透明文字でカーソル/編集を担当 */}
              <div className="md-text-stack">
                <pre className="md-highlight-overlay" ref={overlayRef} aria-hidden="true">
                  <code className={`language-${currentLang}`} dangerouslySetInnerHTML={{ __html: highlighted + '\n' }} />
                </pre>
                <textarea
                  id="md-textarea"
                  ref={textareaRef}
                  placeholder={currentLang === 'markdown' ? 'Markdownを入力...' : `${LANG_LABEL[currentLang]} を入力...`}
                  spellCheck={false}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  // 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: カーソル移動で学習バー更新
                  onSelect={updateLesson}
                  onKeyUp={updateLesson}
                  onClick={updateLesson}
                  onScroll={() => {
                    const ta = textareaRef.current;
                    if (!ta) return;
                    if (lineNumRef.current) lineNumRef.current.scrollTop = ta.scrollTop;
                    if (overlayRef.current) {
                      overlayRef.current.scrollTop = ta.scrollTop;
                      overlayRef.current.scrollLeft = ta.scrollLeft;
                    }
                    if (view !== 'split') return;
                    if (scrollSyncingRef.current) { scrollSyncingRef.current = false; return; }
                    const pv = previewPaneRef.current;
                    if (!pv) return;
                    const max = ta.scrollHeight - ta.clientHeight;
                    const ratio = max > 0 ? ta.scrollTop / max : 0;
                    const pvMax = pv.scrollHeight - pv.clientHeight;
                    scrollSyncingRef.current = true;
                    pv.scrollTop = pvMax * ratio;
                  }}
                />
              </div>
            </div>
          </div>
          {(view === 'split' || view === 'translate') && (
            <div
              className={`md-resizer${dragging ? ' dragging' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
              onDoubleClick={() => setSplitRatio(0.5)}
              role="separator"
              aria-orientation="vertical"
              title="ドラッグで幅調整 / ダブルクリックでリセット"
            />
          )}
          <div
            id="md-panel-preview"
            className={`md-panel${view === 'editor' || view === 'translate' ? ' hidden' : ''}`}
            style={view === 'split' ? { flex: '0 0 calc((1 - var(--split-ratio)) * 100% - 3px)' } : undefined}
          >
            {/* 2026-05-10 04:00:00 claude-opus-4-7[1m] — 言語別プレビュー切替 */}
            {/* 2026-05-11 [opus-4-7] Phase 6: Tier B+ で ▶ 実行ボタン追加（Tier A は既存挙動維持） */}
            <div className="md-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="md-dot-ind" />
              <span style={{ flex: 1 }}>
                {/* 2026-05-11 12:00:00 claude-opus-4-7[1m] セッションターン数：2 — fix: isLivePreviewable() で判定。previewSrcdoc 文字列の真偽で分岐するとHTML空タブで誤フォールバック */}
                {isLivePreviewable(currentLang) ? 'ライブプレビュー' : currentLang === 'markdown' ? 'Preview' : isTierBPlus ? '実行結果' : 'プレビュー'}
              </span>
              {/* 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 未実装言語 disabled + チップ
                  Tier B+ の中で REGISTRY に factory 未登録の言語（PHP / Ruby / Java / Go / C / C++ / Swift）は
                  「準備中」表示。Phase 12-13 で順次対応。 */}
              {isTierBPlus && (
                <button
                  type="button"
                  onClick={triggerRun}
                  disabled={runner.loading || !runner.isImplemented}
                  title={
                    !runner.isImplemented
                      ? '🌱 この言語の実行は近日対応予定だよ（Phase 12 / 13）'
                      : '実行 (Ctrl/Cmd + Enter)'
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: !runner.isImplemented
                      ? 'rgba(166,227,161,0.2)'
                      : runner.loading
                        ? 'rgba(166,227,161,0.3)'
                        : '#a6e3a1',
                    color: !runner.isImplemented ? 'rgba(255,255,255,0.5)' : '#1e1e2e',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: runner.loading || !runner.isImplemented ? 'not-allowed' : 'pointer',
                    opacity: runner.loading || !runner.isImplemented ? 0.6 : 1,
                  }}
                >
                  ▶ {!runner.isImplemented ? '準備中' : runner.loading ? '読み込み中…' : '実行'}
                  {/* 2026-05-10 23:50:00 claude-opus-4-7[1m] セッションターン数：37 — Ctrl+Enter kbd 表示 */}
                  {runner.isImplemented && !runner.loading && (
                    <kbd className="md-shortcut-kbd md-shortcut-kbd-onbtn">Ctrl+Enter</kbd>
                  )}
                </button>
              )}
              {/* 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17
                  Phase 16: トレースボタン。trace 対応言語（Python）のみ表示 */}
              {runner.isTraceable && (
                <button
                  type="button"
                  onClick={triggerTrace}
                  disabled={runner.loading}
                  title="1 行ずつどう動いたか見る (Ctrl/Cmd + Shift + Enter)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(166, 227, 161, 0.35)',
                    background: runner.loading
                      ? 'rgba(166, 227, 161, 0.15)'
                      : 'rgba(166, 227, 161, 0.18)',
                    color: '#a6e3a1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: runner.loading ? 'not-allowed' : 'pointer',
                    opacity: runner.loading ? 0.6 : 1,
                  }}
                >
                  🐾 トレース
                  {!runner.loading && (
                    <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Ctrl+Shift+Enter</kbd>
                  )}
                </button>
              )}
            </div>
            {/* 2026-05-11 12:00:00 claude-opus-4-7[1m] セッションターン数：2 — fix: HTML/CSS/JS/SVG はLang判定で iframe 確定（空タブで「ブラウザで実行できません」誤表示の解消） */}
            {/* 2026-05-11 19:30:00 claude-opus-4-7[1m] セッションターン数：24
                fix: iframe 要素の背景を **markup の時だけ白**、他言語はダーク維持。
                  - markup（HTML/SVG/XML）: 実ブラウザ準拠の白
                  - CSS: ダーク維持（既存 UX）
                  - JS / TS / JSX / TSX: body 内で explicit dark 指定済み、iframe bg は無影響だがダーク維持 */}
            {isLivePreviewable(currentLang) ? (
              /* HTML / CSS / JS / SVG: iframe srcdoc でリアルタイムプレビュー（Tier A） */
              <iframe
                title="ライブプレビュー"
                sandbox="allow-scripts"
                srcDoc={previewSrcdoc}
                style={{ flex: 1, border: 'none', background: currentLang === 'markup' ? '#ffffff' : '#1e1e2e', width: '100%', height: '100%', minHeight: 0 }}
              />
            ) : currentLang === 'markdown' ? (
              /* Markdown: 既存 marked プレビュー（スクロール同期含む） */
              <div
                id="md-preview-pane"
                ref={previewPaneRef}
                onScroll={() => {
                  if (view !== 'split') return;
                  if (scrollSyncingRef.current) { scrollSyncingRef.current = false; return; }
                  const pv = previewPaneRef.current;
                  const ta = textareaRef.current;
                  if (!pv || !ta) return;
                  const pvMax = pv.scrollHeight - pv.clientHeight;
                  const ratio = pvMax > 0 ? pv.scrollTop / pvMax : 0;
                  const taMax = ta.scrollHeight - ta.clientHeight;
                  scrollSyncingRef.current = true;
                  ta.scrollTop = taMax * ratio;
                  if (lineNumRef.current) lineNumRef.current.scrollTop = ta.scrollTop;
                }}
                dangerouslySetInnerHTML={{ __html: preview || '<p style="color:#45475a;font-style:italic;">← Markdownを書くとここにプレビューされます</p>' }}
              />
            ) : isTierBPlus ? (
              /* 2026-05-11 [opus-4-7] Phase 6: Tier B+（Python / SQL etc.）は Runner Framework 経由 */
              /* 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 未実装言語の優しい案内 */
              <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: 12 }}>
                {!runner.isImplemented ? (
                  <div className="md-no-preview" style={{ padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>🌱</p>
                    <p><strong>{LANG_LABEL[currentLang]}</strong></p>
                    <p>この言語の実行は近日対応予定だよ。</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
                      Phase 12 / 13 で Ruby / PHP / Java / Go / C / C++ / Swift を順次サポート予定。<br />
                      シンタックスハイライトと編集はそのまま使えるよ ✨
                    </p>
                  </div>
                ) : runner.loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <LoaderMessages
                      lang={currentLang}
                      state="loading"
                      pct={runner.loadProgress?.pct ?? 0}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                ) : (
                  /* 2026-05-11 14:30:00 claude-opus-4-7[1m] セッションターン数：11 — Phase 10: lang 渡し（Lesson バナー用） */
                  /* 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: traceSteps 渡し */
                  <RunnerOutput
                    result={runner.lastResult}
                    loading={false}
                    error={runner.error}
                    lang={currentLang}
                    traceSteps={runner.lastTraceSteps}
                  />
                )}
              </div>
            ) : (
              /* プレビュー対象外（unknown tier） */
              <div className="md-no-preview">
                <p><strong>{LANG_LABEL[currentLang]}</strong></p>
                <p>このファイル形式はブラウザで実行できません。</p>
                <p>編集とシンタックスハイライトのみ動作します。</p>
              </div>
            )}
          </div>
          {/* 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — 🌐 翻訳ペイン（日→英・オンデバイス Translator API） */}
          {view === 'translate' && (
            <div
              id="md-panel-translate"
              className="md-panel"
              style={{ flex: '0 0 calc((1 - var(--split-ratio)) * 100% - 3px)' }}
            >
              <div className="md-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="md-dot-ind" />
                <span style={{ flex: 1 }}>🌐 英語訳</span>
                <label className="md-translate-toggle" title="自動翻訳の ON / OFF">
                  <input
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                  />
                  <span>自動翻訳 {autoTranslate ? 'ON' : 'OFF'}</span>
                </label>
                {!autoTranslate && translatorStatus !== 'unsupported' && (
                  <button
                    type="button"
                    className="md-translate-now-btn"
                    onClick={() => {
                      const text = tabs.find(t => t.id === activeId)?.content ?? '';
                      if (text.trim()) void runTranslate(text);
                    }}
                  >
                    今すぐ翻訳
                  </button>
                )}
              </div>
              <div className="md-translate-body">
                {/* 2026-06-02 claude-opus-4-8[1m] セッションターン数：3 — iframe 埋め込み時は「ブラウザ未対応」ではなく
                    「埋め込みでは使えない／新しいタブで開く」導線を出す（Translator はクロスオリジン iframe に露出しないため誤誘導を避ける）。 */}
                {translatorStatus === 'unsupported' ? (
                  inIframe ? (
                    <div className="md-no-preview" style={{ padding: 24, textAlign: 'center' }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>🌐</p>
                      <p>埋め込み表示では翻訳を使えません。</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
                        お使いのブラウザは翻訳に対応していますが、埋め込み（iframe）表示では利用できません。<br />
                        下のボタンから新しいタブで開くと、そのまま翻訳をご利用いただけます。
                      </p>
                      <a
                        href="https://kojinius.jp/md-editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16,
                          padding: '8px 18px', borderRadius: 8, textDecoration: 'none',
                          fontSize: 13, fontWeight: 700, color: '#fff',
                          background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
                        }}
                      >
                        新しいタブで開く
                      </a>
                    </div>
                  ) : (
                    <div className="md-no-preview" style={{ padding: 24, textAlign: 'center' }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>🌐</p>
                      <p>このブラウザはオンデバイス翻訳に未対応です。</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
                        Chrome / Edge 138 以降（デスクトップ）でご利用ください。<br />
                        翻訳は端末内で完結し、入力内容は外部に送信されません。
                      </p>
                    </div>
                  )
                ) : translatorStatus === 'downloading' ? (
                  <div style={{ padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>⬇️</p>
                    <p>翻訳モデルを準備中… {downloadPct}%</p>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
                      <div style={{ width: `${downloadPct}%`, height: '100%', background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', transition: 'width 200ms ease' }} />
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
                      初回のみダウンロードが必要です（端末内処理・外部送信なし）。
                    </p>
                  </div>
                ) : (
                  <div className="md-translate-output">
                    {translatedText
                      ? translatedText
                      : (
                        <span style={{ color: '#45475a', fontStyle: 'italic' }}>
                          ← 左に日本語を入力すると、ここに英語訳が表示されます{autoTranslate ? '' : '（自動翻訳 OFF: 「今すぐ翻訳」で実行）'}
                        </span>
                      )}
                    {translatorStatus === 'translating' && (
                      <span className="md-translate-spinner"> …翻訳中</span>
                    )}
                    {translatorStatus === 'error' && (
                      <div style={{ color: '#f38ba8', marginTop: 12 }}>翻訳に失敗しました。もう一度お試しください。</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: 学習バー */}
        {/* 2026-05-10 07:00:00 claude-opus-4-7[1m] — fix: bar 全体をクリック可能にして「詳しく」見つけやすく */}
        <div
          className={`md-lesson-bar${currentLesson ? ' md-lesson-bar-active md-lesson-bar-clickable' : ''}`}
          onClick={currentLesson ? () => { setPinnedLesson(currentLesson); setLessonExpanded(true); } : undefined}
          onKeyDown={currentLesson ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPinnedLesson(currentLesson);
              setLessonExpanded(true);
            }
          } : undefined}
          role={currentLesson ? 'button' : undefined}
          tabIndex={currentLesson ? 0 : undefined}
          aria-label={currentLesson ? `${currentLesson.keyword} の詳しい説明を見る` : undefined}
          title={currentLesson ? 'クリックで詳しい説明を見る (Alt+H)' : undefined}
        >
          {currentLesson ? (
            <>
              <span className="md-lesson-emoji" aria-hidden="true">{currentLesson.lesson.emoji}</span>
              <code className="md-lesson-keyword">{currentLesson.keyword}</code>
              <span className="md-lesson-arrow" aria-hidden="true">—</span>
              <span className="md-lesson-short">{currentLesson.lesson.short}</span>
              {/* 2026-05-10 23:50:00 claude-opus-4-7[1m] セッションターン数：37 — Alt+H kbd 表示（既に keybinding 実装済） */}
              <span className="md-lesson-detail-cta" aria-hidden="true">
                ✨ 詳しく <kbd className="md-shortcut-kbd md-shortcut-kbd-onbtn">Alt+H</kbd>
              </span>
            </>
          ) : (
            <span className="md-lesson-hint">💡 キーワードの上にカーソルを置くとヒントが出るよ</span>
          )}
        </div>

        {/* ステータスバー */}
        <div className="md-statusbar">
          <span style={{ color: savedLabel.color }}>{savedLabel.text}</span>
          <span className="md-sep">|</span>
          <span>{stats.chars}</span>
          <span className="md-sep">|</span>
          <span>{stats.words}</span>
          <span className="md-sep">|</span>
          <span>{stats.lines}</span>
          {/* 2026-05-11 16:30:00 claude-opus-4-7[1m] セッションターン数：16 — Alt+/ 補完トリガーをステータスバーに常時表示 */}
          <span className="md-sep">|</span>
          <span title="入力中にキーワード補完ピッカーを開く">
            💡 補完 <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Alt+/</kbd>
          </span>
          <button className="md-status-btn" onClick={copyMarkdown}>
            {copyState === 'copied' ? '✅ コピー済み' : `📋 ${LANG_SHORT_LABEL[currentLang]}をコピー`}
          </button>
          <button id="md-btn-save" className="md-status-btn" onClick={() => saveToFile()}>
            💾 ファイル保存 <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Ctrl+S</kbd>
          </button>
          {/* 2026-05-11 20:00:00 claude-opus-4-7[1m] セッションターン数：28
              PDF 出力（設計書: documents/design/craftica-editor-pdf-export.md）
              2026-05-11 20:15:00 セッションターン数：29 — Alt+P ショートカット表示 */}
          <button id="md-btn-pdf" className="md-status-btn" onClick={exportPdf} title="現在のタブを PDF として出力（Alt+P）">
            📄 PDF 出力 <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Alt+P</kbd>
          </button>
        </div>
      </div>

      {/* 2026-06-01 claude-opus-4-8[1m] セッションターン数：1 — kojinius 移植: 課題提出確認モーダル除去 */}

      {/* 未保存クローズダイアログ */}
      {closeDlgId !== null && (
        <div className="md-overlay" onClick={e => { if (e.target === e.currentTarget) setCloseDlgId(null); }}>
          <div className="md-dialog-box">
            {/* 2026-05-17 13:00:00 claude-opus-4-7[1m] セッションターン数：10 — ⚠️→💾（member 萎縮回避） */}
            <h3>💾 未保存の変更があります</h3>
            <p><strong>{tabs.find(t => t.id === closeDlgId)?.name}</strong> に保存されていない変更があります。<br />閉じる前に保存しますか？</p>
            <div className="md-dialog-actions">
              <button className="md-btn-discard" onClick={() => doCloseTab(closeDlgId)}>保存せず閉じる</button>
              <button onClick={() => setCloseDlgId(null)}>キャンセル</button>
              <button className="md-btn-save-dlg" onClick={dlgSave}>💾 保存する</button>
            </div>
          </div>
        </div>
      )}

      {/* ファイルメニュー外クリック閉じ */}
      {fileMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setFileMenu(false)} />}

      {/* 2026-05-10 06:00:00 claude-opus-4-7[1m] — Phase 5: 学習詳細 popup */}
      {/* 2026-05-10 11:45:00 claude-opus-4-7[1m] — fix: pinnedLesson で固定表示、外クリック/×/Esc のみで閉じる */}
      {lessonExpanded && pinnedLesson && (
        <div
          className="md-lesson-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopSpeak();
              setLessonSpeaking(false);
              setLessonExpanded(false);
              setPinnedLesson(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="キーワード詳細"
        >
          <div className="md-lesson-popup">
            <div className="md-lesson-popup-header">
              <span className="md-lesson-emoji-large" aria-hidden="true">{pinnedLesson.lesson.emoji}</span>
              <code className="md-lesson-popup-title">{pinnedLesson.keyword}</code>
              {/* 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21
                  Phase 18b: TTS 読み上げボタン（ブラウザ対応時のみ） */}
              {isSpeechSupported() && (
                <button
                  type="button"
                  className="md-lesson-close"
                  onClick={() => {
                    if (lessonSpeaking) {
                      stopSpeak();
                      setLessonSpeaking(false);
                    } else {
                      const text = pinnedLesson.lesson.detail ?? pinnedLesson.lesson.short;
                      setLessonSpeaking(true);
                      speak(text, {
                        onEnd: () => setLessonSpeaking(false),
                        onError: () => setLessonSpeaking(false),
                      });
                    }
                  }}
                  aria-label={lessonSpeaking ? '読み上げを止める' : '読み上げる'}
                  title={lessonSpeaking ? '読み上げを止める' : '読み上げる'}
                >{lessonSpeaking ? '⏹' : '🔊'}</button>
              )}
              <button
                type="button"
                className="md-lesson-close"
                onClick={() => { stopSpeak(); setLessonSpeaking(false); setLessonExpanded(false); setPinnedLesson(null); }}
                aria-label="閉じる"
              >×</button>
            </div>
            <p className="md-lesson-popup-detail">{pinnedLesson.lesson.detail ?? pinnedLesson.lesson.short}</p>
            {pinnedLesson.lesson.example && (
              <div className="md-lesson-popup-example-wrap">
                <div className="md-lesson-popup-example-label">
                  <span>✨ 使ってみよう</span>
                  {/* 2026-05-11 18:00:00 claude-opus-4-7[1m] セッションターン数：20
                      Phase 18a: ワンクリック挿入 — 「📋 コピー」の隣に「➕ 挿入」ボタン追加 */}
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <button
                      type="button"
                      className="md-lesson-copy-btn"
                      onClick={() => {
                        const ta = textareaRef.current;
                        const ex = pinnedLesson.lesson.example;
                        if (!ta || !ex) return;
                        const s = ta.selectionStart;
                        const e = ta.selectionEnd;
                        ta.setRangeText(ex, s, e, 'end');
                        stopSpeak();
                        setLessonSpeaking(false);
                        setLessonExpanded(false);
                        setPinnedLesson(null);
                        ta.focus();
                        handleInput();
                      }}
                      aria-label="サンプルコードをエディタに挿入"
                    >
                      ➕ 挿入 <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Enter</kbd>
                    </button>
                    <button
                      type="button"
                      className={`md-lesson-copy-btn${exampleCopied ? ' md-lesson-copy-btn-done' : ''}`}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(pinnedLesson.lesson.example!);
                          setExampleCopied(true);
                          setTimeout(() => setExampleCopied(false), 1800);
                        } catch { /* clipboard 不可環境は無視 */ }
                      }}
                      aria-label="コードをコピー"
                    >
                      {exampleCopied ? '✅ コピーしたよ！' : <>📋 コピー <kbd className="md-shortcut-kbd md-shortcut-kbd-subtle">Ctrl+C</kbd></>}
                    </button>
                  </div>
                </div>
                <pre className="md-lesson-popup-example"><code>{pinnedLesson.lesson.example}</code></pre>
              </div>
            )}
            {/* 2026-05-11 16:00:00 claude-opus-4-7[1m] セッションターン数：15
                Phase 15: 公式 doc リンク。getReferenceLink が null の場合は非表示で既存 UX 維持 */}
            {(() => {
              const refLink = getReferenceLink(currentLang, pinnedLesson.keyword);
              if (!refLink) return null;
              return (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <a
                    href={refLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${pinnedLesson.keyword} の公式 doc を開く（新規タブ）`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: 'rgba(137, 180, 250, 0.12)',
                      border: '1px solid rgba(137, 180, 250, 0.35)',
                      color: '#89b4fa',
                      fontSize: 13,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    📖 {refLink.label} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              );
            })()}
            <div className="md-lesson-popup-footer">
              <span className="md-lesson-popup-tip">💡 Enter で挿入 / Ctrl+C でコピー / Esc で閉じる</span>
            </div>
          </div>
        </div>
      )}

      {/* 絵文字ピッカー (2026-05-04 claude-sonnet-4-6 セッションターン数：6) */}
      {emojiPicker && filteredEmojis.length > 0 && (
        <div ref={emojiPickerDivRef} style={{ position:'fixed', top:emojiPicker.top, left:emojiPicker.left, zIndex:9999, background:'#1e1e2e', border:'1px solid #45475a', borderRadius:'10px', boxShadow:'0 8px 32px rgba(0,0,0,.65)', width:'284px', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'6px 12px', fontSize:'13px', color:'#a6adc8', borderBottom:'1px solid #313244', fontFamily:'monospace', letterSpacing:1 }}>:{emojiPicker.query || '…'}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1px', padding:'6px', overflowY:'auto', maxHeight:'210px' }}>
            {filteredEmojis.map((item, i) => (
              <button
                key={i}
                data-sel={i === emojiPicker.idx ? '' : undefined}
                title={item.k.split(' ')[0]}
                onMouseDown={ev => { ev.preventDefault(); insertEmoji(item.e); }}
                onMouseEnter={() => setEmojiPicker(p => p ? { ...p, idx: i } : null)}
                style={{ width:'34px', height:'34px', background: i === emojiPicker.idx ? '#313244' : 'transparent', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.08s', padding:0, flexShrink:0 }}
              >{item.e}</button>
            ))}
          </div>
        </div>
      )}

      {/* 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13 — Phase 14: Guided Completion ピッカー */}
      {completion && filteredCompletions.length > 0 && (
        <div
          ref={completionDivRef}
          style={{
            position: 'fixed',
            top: completion.top,
            left: completion.left,
            zIndex: 9999,
            background: '#1e1e2e',
            border: '1px solid #45475a',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,.65)',
            width: 360,
            maxHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#cdd6f4',
          }}
          role="listbox"
          aria-label="補完候補"
        >
          <div style={{ padding: '6px 12px', fontSize: 13, color: '#a6adc8', borderBottom: '1px solid #313244', fontFamily: 'monospace', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔍</span>
            <span>{completion.prefix || '…'}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>↑↓ 選択 / Enter 挿入 / Esc 閉じる</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 280 }}>
            {filteredCompletions.map((item, i) => (
              <button
                key={item.keyword}
                data-sel={i === completion.idx ? '' : undefined}
                onMouseDown={(ev) => { ev.preventDefault(); insertCompletion(item); }}
                onMouseEnter={() => setCompletion(p => p ? { ...p, idx: i } : null)}
                role="option"
                aria-selected={i === completion.idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  width: '100%',
                  padding: '8px 12px',
                  background: i === completion.idx ? '#313244' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }} aria-hidden="true">{item.lesson.emoji}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <code style={{ color: '#89dceb', fontWeight: 600, fontSize: 13 }}>{item.keyword}</code>
                  <span style={{ marginLeft: 8, color: '#a6adc8', fontSize: 13 }}>— {item.lesson.short}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
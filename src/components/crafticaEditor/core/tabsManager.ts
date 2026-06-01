// 2026-05-11 [opus-4-7] Phase 6: タブ localStorage 永続化を抽出
// 元 src/components/CrafticaEditor.tsx L265-286 から（挙動変化なし）
import type { Tab } from '../types';

export const STORAGE_KEY = 'craftica-editor-tabs';
export const ACTIVE_KEY = 'craftica-editor-active';

export function loadTabs(): { tabs: Tab[]; activeId: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as Array<{ id: number; name: string; content: string }>;
    const activeId = parseInt(localStorage.getItem(ACTIVE_KEY) || '0', 10);
    const tabs: Tab[] = snap.map(s => ({ ...s, saved: true, fileHandle: null, scrollTop: 0 }));
    return { tabs, activeId: tabs.find(t => t.id === activeId) ? activeId : tabs[0].id };
  } catch {
    return null;
  }
}

export function saveTabs(tabs: Tab[], activeTabId: number): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tabs.map(t => ({ id: t.id, name: t.name, content: t.content })))
    );
    localStorage.setItem(ACTIVE_KEY, String(activeTabId));
  } catch {
    /* ストレージ Quota 超過等は黙殺（次の入力で再試行される） */
  }
}

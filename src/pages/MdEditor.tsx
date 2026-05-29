// 2026-05-04 claude-sonnet-4-6 セッションターン数：5
import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';

/* ── 型定義 ── */
interface Tab {
  id: number;
  name: string;
  content: string;
  saved: boolean;
  fileHandle: FileSystemFileHandle | null;
  scrollTop: number;
}
type ViewMode = 'split' | 'editor' | 'preview';

/* ── marked 設定 ── */
// 2026-05-04 claude-sonnet-4-6 セッションターン数：4
// renderer hook は使わず marked のデフォルトに委譲。
// チェックボックス行の list-style 除去は CSS :has() で対応。
marked.use({ breaks: true, gfm: true });

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseMd(md: string): string {
  if (!md.trim()) return '';
  let html = marked.parse(md) as string;
  html = html.replace(/<aside>([\s\S]*?)<\/aside>/gi, (_, inner) => {
    const text = inner.trim();
    const m = text.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
    const icon = m ? m[0] : '📝';
    const body = m ? text.slice(m[0].length).trim() : text;
    return `<div class="md-callout"><span>${icon}</span><div>${marked.parse(body)}</div></div>`;
  });
  return html;
}

/* ── ユーティリティ ── */
const STORAGE_KEY = 'md-editor-tabs';
const ACTIVE_KEY  = 'md-editor-active';

function loadTabs(): { tabs: Tab[]; activeId: number } | null {
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

function saveTabs(tabs: Tab[], activeTabId: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs.map(t => ({ id: t.id, name: t.name, content: t.content }))));
    localStorage.setItem(ACTIVE_KEY, String(activeTabId));
  } catch {}
}

/* ── 絵文字データ (2026-05-04 claude-sonnet-4-6 セッションターン数：6) ── */
type EmojiEntry = { e: string; k: string };
const EMOJIS: EmojiEntry[] = [
  // 顔・感情
  {e:'😀',k:'grinning smile happy 笑顔 嬉しい'},{e:'😁',k:'grin beaming smile 歯 笑'},{e:'😂',k:'joy laugh cry tears 笑い泣き'},{e:'🤣',k:'rofl rolling floor laugh 爆笑'},{e:'😊',k:'smile blush 微笑み'},{e:'😇',k:'innocent halo angel 天使'},{e:'🥰',k:'hearts love 愛 ハート 幸せ'},{e:'😍',k:'heart eyes love 目がハート'},{e:'🤩',k:'star struck excited キラキラ 興奮'},{e:'😘',k:'kiss wink キス'},{e:'😋',k:'yum delicious おいしい'},{e:'😎',k:'cool sunglasses クール サングラス'},{e:'🤗',k:'hugging hug ハグ'},{e:'🤔',k:'thinking hmm 考え中'},{e:'🤫',k:'shushing secret しー 内緒'},{e:'🤭',k:'giggle laugh 口に手'},{e:'😐',k:'neutral 無表情'},{e:'😏',k:'smirk ニヤリ 含み笑い'},{e:'😒',k:'unamused 不満 つまらない'},{e:'🙄',k:'eye roll あきれる'},{e:'😔',k:'pensive sad 落ち込む'},{e:'😴',k:'sleeping sleep 寝る ZZZ'},{e:'😷',k:'mask sick 病気 マスク'},{e:'🤒',k:'thermometer fever 熱 病気'},{e:'🤕',k:'bandage hurt けが'},{e:'🤢',k:'nauseated 吐き気 気持ち悪い'},{e:'🤮',k:'vomit 嘔吐'},{e:'🥵',k:'hot heat 暑い'},{e:'🥶',k:'cold freeze 寒い'},{e:'🤯',k:'exploding head 衝撃 びっくり'},{e:'🥳',k:'party celebrate パーティー 祝い'},{e:'😢',k:'crying tear 泣き'},{e:'😭',k:'sob loud cry 大泣き'},{e:'😱',k:'scream fear 叫び 恐怖'},{e:'😡',k:'angry 怒り'},{e:'🤬',k:'cursing 激怒'},{e:'😈',k:'devil evil 悪魔'},{e:'💀',k:'skull death 骸骨 死'},{e:'💩',k:'poop ウンコ'},{e:'🤖',k:'robot ロボット AI'},{e:'👻',k:'ghost おばけ'},{e:'👽',k:'alien 宇宙人'},{e:'🤡',k:'clown ピエロ'},
  // ジェスチャー・手
  {e:'👋',k:'wave hello bye 手を振る'},{e:'✋',k:'raised hand stop ストップ'},{e:'👌',k:'ok okay 了解 OK'},{e:'✌️',k:'victory peace ピース'},{e:'🤞',k:'crossed fingers luck 幸運'},{e:'🤟',k:'love you 愛してる'},{e:'🤘',k:'rock ロック'},{e:'👍',k:'thumbs up good いいね'},{e:'👎',k:'thumbs down bad ダメ'},{e:'👏',k:'clapping applause 拍手'},{e:'🙌',k:'raising hands 万歳'},{e:'🙏',k:'pray thank please お願い ありがとう 合掌'},{e:'💪',k:'muscle flex strong 力こぶ'},{e:'👀',k:'eyes look see 目'},{e:'👅',k:'tongue 舌'},{e:'🧠',k:'brain smart 脳 頭脳'},
  // ハート
  {e:'❤️',k:'red heart love 赤ハート 愛'},{e:'🧡',k:'orange heart オレンジ'},{e:'💛',k:'yellow heart 黄色'},{e:'💚',k:'green heart 緑'},{e:'💙',k:'blue heart 青'},{e:'💜',k:'purple heart 紫'},{e:'🖤',k:'black heart 黒'},{e:'🤍',k:'white heart 白'},{e:'💔',k:'broken heart 失恋'},{e:'💕',k:'two hearts ラブラブ'},{e:'💖',k:'sparkling heart キラキラ'},{e:'💗',k:'growing heart'},{e:'💘',k:'heart arrow キューピッド'},{e:'💝',k:'heart ribbon プレゼント'},
  // 動物
  {e:'🐶',k:'dog puppy 犬 わんわん'},{e:'🐱',k:'cat kitten 猫 にゃー'},{e:'🐭',k:'mouse ネズミ'},{e:'🐹',k:'hamster ハムスター'},{e:'🐰',k:'rabbit bunny ウサギ'},{e:'🦊',k:'fox キツネ'},{e:'🐻',k:'bear クマ'},{e:'🐼',k:'panda パンダ'},{e:'🐨',k:'koala コアラ'},{e:'🐯',k:'tiger トラ'},{e:'🦁',k:'lion ライオン'},{e:'🐮',k:'cow ウシ'},{e:'🐷',k:'pig ブタ'},{e:'🐸',k:'frog カエル'},{e:'🐵',k:'monkey サル'},{e:'🐔',k:'chicken ニワトリ'},{e:'🐧',k:'penguin ペンギン'},{e:'🦆',k:'duck アヒル'},{e:'🦋',k:'butterfly チョウ'},{e:'🐝',k:'bee honeybee ハチ'},{e:'🐞',k:'ladybug テントウムシ'},{e:'🦀',k:'crab カニ'},{e:'🐙',k:'octopus タコ'},{e:'🐠',k:'fish 熱帯魚'},{e:'🐬',k:'dolphin イルカ'},{e:'🦈',k:'shark サメ'},{e:'🐢',k:'turtle カメ'},{e:'🐍',k:'snake ヘビ'},{e:'🐉',k:'dragon 竜 ドラゴン'},{e:'🦄',k:'unicorn ユニコーン'},
  // 植物・自然
  {e:'🌸',k:'cherry blossom sakura 桜'},{e:'🌺',k:'hibiscus 花'},{e:'🌻',k:'sunflower ヒマワリ'},{e:'🌹',k:'rose バラ'},{e:'🌷',k:'tulip チューリップ'},{e:'💐',k:'bouquet 花束'},{e:'🌱',k:'seedling sprout 芽'},{e:'🌿',k:'herb leaf 葉'},{e:'🍀',k:'clover luck 四つ葉 幸運'},{e:'🍁',k:'maple leaf 紅葉 もみじ'},{e:'☀️',k:'sun sunny 太陽 晴れ'},{e:'🌧️',k:'rain 雨'},{e:'⛈️',k:'thunder storm 雷雨'},{e:'❄️',k:'snowflake cold winter 雪 寒い'},{e:'⛄',k:'snowman 雪だるま'},{e:'🌈',k:'rainbow 虹'},{e:'🔥',k:'fire flame hot 炎 熱い'},{e:'💧',k:'droplet water 水'},{e:'🌊',k:'wave ocean 波 海'},{e:'🌍',k:'earth globe world 地球'},{e:'🌕',k:'full moon 満月'},{e:'🌙',k:'crescent moon 三日月'},{e:'⭐',k:'star 星'},{e:'✨',k:'sparkles きらきら'},{e:'💫',k:'dizzy star くらくら'},{e:'🌟',k:'glowing star 輝く星'},
  // 食べ物・飲み物
  {e:'🍎',k:'apple リンゴ'},{e:'🍊',k:'orange tangerine みかん'},{e:'🍋',k:'lemon レモン'},{e:'🍇',k:'grapes ブドウ'},{e:'🍓',k:'strawberry イチゴ'},{e:'🍑',k:'peach モモ 桃'},{e:'🍒',k:'cherries チェリー さくらんぼ'},{e:'🍕',k:'pizza ピザ'},{e:'🍔',k:'burger hamburger バーガー'},{e:'🍟',k:'fries フライドポテト'},{e:'🍜',k:'ramen noodle ラーメン'},{e:'🍣',k:'sushi 寿司'},{e:'🍱',k:'bento 弁当'},{e:'🍙',k:'rice ball onigiri おにぎり'},{e:'🍰',k:'cake shortcake ケーキ'},{e:'🎂',k:'birthday cake バースデー 誕生日'},{e:'🍩',k:'donut ドーナツ'},{e:'🍪',k:'cookie クッキー'},{e:'🍫',k:'chocolate チョコレート'},{e:'🍬',k:'candy キャンディ'},{e:'☕',k:'coffee コーヒー'},{e:'🍵',k:'tea お茶 緑茶'},{e:'🧋',k:'bubble tea タピオカ'},{e:'🍺',k:'beer ビール'},{e:'🍻',k:'cheers 乾杯'},{e:'🥂',k:'champagne シャンパン'},{e:'🍷',k:'wine ワイン'},
  // 乗り物・場所
  {e:'🚀',k:'rocket launch space ロケット 宇宙'},{e:'✈️',k:'airplane flight 飛行機'},{e:'🚗',k:'car auto 車 自動車'},{e:'🚌',k:'bus バス'},{e:'🚕',k:'taxi タクシー'},{e:'🚑',k:'ambulance 救急車'},{e:'🚒',k:'fire truck 消防車'},{e:'🛸',k:'ufo UFO'},{e:'⛵',k:'sailboat ヨット'},{e:'🚢',k:'ship 船'},{e:'🏠',k:'house home 家'},{e:'🏢',k:'office building ビル'},{e:'🗼',k:'tokyo tower 東京タワー'},{e:'🏯',k:'castle 城'},{e:'🌏',k:'asia earth 地球 アジア'},
  // 活動・スポーツ
  {e:'⚽',k:'soccer football サッカー'},{e:'🏀',k:'basketball バスケ'},{e:'⚾',k:'baseball 野球'},{e:'🎾',k:'tennis テニス'},{e:'🏓',k:'table tennis ping pong 卓球'},{e:'🥊',k:'boxing ボクシング'},{e:'🎮',k:'video game ゲーム コントローラー'},{e:'🎲',k:'dice サイコロ'},{e:'🎯',k:'dart target ダーツ'},{e:'🎨',k:'art palette 絵 アート'},{e:'🎬',k:'cinema movie 映画'},{e:'🎤',k:'microphone マイク 歌'},{e:'🎵',k:'music note 音楽 音符'},{e:'🎶',k:'music notes メロディ'},{e:'🎸',k:'guitar ギター'},{e:'🎹',k:'piano ピアノ'},{e:'🥁',k:'drum ドラム 太鼓'},{e:'🎺',k:'trumpet トランペット'},{e:'🎻',k:'violin バイオリン'},{e:'🏆',k:'trophy win champion トロフィー 優勝'},{e:'🥇',k:'gold medal 金メダル'},{e:'🎁',k:'gift present プレゼント'},{e:'🎉',k:'party popper 祝い パーティー'},{e:'🎊',k:'confetti お祝い'},{e:'🎈',k:'balloon 風船'},{e:'🎆',k:'fireworks 花火'},
  // オブジェクト・ツール
  {e:'📱',k:'phone mobile smartphone スマホ 携帯'},{e:'💻',k:'laptop computer パソコン PC'},{e:'🖥️',k:'desktop computer デスクトップ'},{e:'⌨️',k:'keyboard キーボード'},{e:'🖱️',k:'mouse マウス'},{e:'📷',k:'camera 写真 カメラ'},{e:'📺',k:'television TV テレビ'},{e:'🔋',k:'battery charge バッテリー 充電'},{e:'💡',k:'light bulb idea アイデア ひらめき'},{e:'📚',k:'books reading 本 読書'},{e:'📖',k:'book open 本'},{e:'📝',k:'memo note メモ ノート'},{e:'📋',k:'clipboard クリップボード'},{e:'📌',k:'pin 画鋲 ピン'},{e:'✏️',k:'pencil 鉛筆'},{e:'🔍',k:'search magnify 検索 虫眼鏡'},{e:'🔒',k:'locked 鍵 ロック'},{e:'🔑',k:'key 鍵 キー'},{e:'🔧',k:'wrench 工具 修理'},{e:'⚙️',k:'gear setting 歯車 設定'},{e:'🧲',k:'magnet 磁石'},{e:'🧪',k:'test tube lab 実験'},{e:'🔬',k:'microscope 顕微鏡'},{e:'🔭',k:'telescope 望遠鏡'},{e:'💊',k:'pill medicine 薬'},{e:'💉',k:'syringe injection 注射'},{e:'🏷️',k:'label tag タグ'},{e:'🔖',k:'bookmark しおり'},
  // 記号・シンボル
  {e:'✅',k:'check done complete 完了 OK チェック'},{e:'❌',k:'cross no wrong NG バツ 間違い'},{e:'⚠️',k:'warning caution 警告 注意'},{e:'🚫',k:'prohibited no 禁止'},{e:'♻️',k:'recycle リサイクル'},{e:'💯',k:'hundred 100点 完璧 満点'},{e:'💢',k:'anger 怒り'},{e:'💥',k:'explosion 爆発'},{e:'💦',k:'sweat water 汗 水'},{e:'💨',k:'wind 風 速い'},{e:'💬',k:'speech bubble comment 吹き出し'},{e:'💭',k:'thought 考え 思考'},{e:'🔔',k:'bell notification 通知 ベル'},{e:'📣',k:'megaphone announce アナウンス'},{e:'🔊',k:'volume speaker 大音量'},{e:'🔇',k:'mute 消音'},{e:'💤',k:'zzz sleep 睡眠 ZZZ'},{e:'❓',k:'question 疑問'},{e:'❗',k:'exclamation 感嘆'},{e:'✅',k:'check ok 完了'},{e:'🆕',k:'new 新しい NEW'},{e:'🆒',k:'cool クール'},{e:'🆓',k:'free 無料'},{e:'🔴',k:'red circle 赤丸'},{e:'🟢',k:'green circle 緑丸'},{e:'🔵',k:'blue circle 青丸'},{e:'⚫',k:'black circle 黒丸'},{e:'⚪',k:'white circle 白丸'},{e:'🇯🇵',k:'japan flag 日本 国旗'},{e:'🇺🇸',k:'usa america flag アメリカ'},
];

/* ════════════════════════════════════
   コンポーネント本体
   ════════════════════════════════════ */
export default function MdEditor() {
  const counterRef   = useRef(0);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const lineNumRef   = useRef<HTMLDivElement>(null);
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
  const [stats, setStats]         = useState({ chars: '0 文字', words: '0 単語', lines: '1 行' });
  const [savedLabel, setSavedLabel] = useState<{ text: string; color: string }>({ text: '● 自動保存済み', color: '#a6e3a1' });
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

  /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
  /* 分割ハンドル：ドラッグ中のグローバルマウスイベント */
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = panelsRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setSplitRatio(Math.max(0.1, Math.min(0.9, ratio)));
    };
    const onUp = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  /* タイトル設定 */
  // 2026-05-04 claude-sonnet-4-6 セッションターン数：8
  // manifestはdist/md-editor.htmlに静的リンクとして埋め込み済み。動的注入廃止。
  useEffect(() => {
    const prevTitle = document.title;
    document.title = '✏️ MD Editor';
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
    textareaRef.current.value     = tab.content;
    textareaRef.current.scrollTop = tab.scrollTop;
    updateLineNumbers(tab.content);
    updateStats(tab.content);
    setPreview(parseMd(tab.content));
  }, [activeId, tabs.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setFileMenu(v => !v); return; }
        if (e.key === 'o' || e.key === 'O') { e.preventDefault(); openFile(); return; }
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
    setPreview(parseMd(val));
    updateLineNumbers(val);
    updateStats(val);
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

  /* ── MDコピー ── */
  function copyMarkdown() {
    navigator.clipboard.writeText(textareaRef.current?.value ?? '').then(() => {
      const btn = document.getElementById('md-btn-copy');
      if (btn) { btn.textContent = '✅ コピー済み'; setTimeout(() => { if (btn) btn.textContent = '📋 MDをコピー'; }, 1800); }
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
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); wrapSel('**', '**'); return; }
      if (e.key === 'i') { e.preventDefault(); wrapSel('*', '*'); return; }
      if (e.key === 'k') { e.preventDefault(); insertLink(); return; }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); saveToFile(e.shiftKey); return; }
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

  /* ── 現在タブ情報 ── */
  const currentTab = tabs.find(t => t.id === activeId);

  /* ─────────────────────────────────────
     JSX
     ───────────────────────────────────── */
  return (
    <>
      <style>{`
        .md-shell { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: #1e1e2e; font-family: 'Inter', sans-serif; }
        .md-titlebar { background: #181825; padding: 10px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #313244; }
        .md-dot { width:12px; height:12px; border-radius:50%; }
        .md-file-menu-wrap { position: relative; }
        .md-file-btn { background:transparent; border:none; color:#a6adc8; font-size:12px; font-weight:600; font-family:inherit; padding:4px 10px; border-radius:6px; cursor:pointer; transition:all 0.15s; }
        .md-file-btn:hover, .md-file-btn.open { background:#313244; color:#cdd6f4; }
        .md-dropdown { display:none; position:absolute; top:calc(100% + 4px); left:0; background:#181825; border:1px solid #45475a; border-radius:8px; min-width:200px; box-shadow:0 8px 24px rgba(0,0,0,.5); z-index:999; padding:4px 0; }
        .md-dropdown.visible { display:block; }
        .md-ditem { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; color:#cdd6f4; font-size:13px; cursor:pointer; gap:16px; }
        .md-ditem:hover { background:#313244; }
        .md-ditem-key { color:#6c7086; font-size:11px; font-family:monospace; }
        .md-dsep { height:1px; background:#313244; margin:4px 0; }
        .md-title-center { margin:0 auto; color:#cdd6f4; font-size:13px; font-weight:600; opacity:.7; }
        .md-toolbar { background:#181825; border-bottom:1px solid #313244; padding:8px 16px; display:flex; flex-wrap:wrap; align-items:center; gap:2px; flex-shrink:0; }
        .md-tb-group { display:flex; align-items:center; gap:1px; padding:0 8px; border-right:1px solid #313244; }
        .md-tb-group:last-of-type { border-right:none; }
        .md-tb-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; border-radius:7px; cursor:pointer; color:#a6adc8; font-size:13px; transition:all 0.15s; position:relative; }
        .md-tb-btn:hover { background:#313244; color:#cdd6f4; }
        .md-tb-btn.wide { width:auto; padding:0 10px; font-size:12px; font-weight:600; font-family:inherit; }
        .md-tb-btn[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:-28px; left:50%; transform:translateX(-50%); background:#11111b; color:#cdd6f4; font-size:11px; padding:3px 8px; border-radius:6px; white-space:nowrap; pointer-events:none; z-index:99; border:1px solid #313244; }
        .md-view-tabs { margin-left:auto; display:flex; gap:4px; }
        .md-view-tab { padding:5px 14px; border-radius:7px; border:none; background:transparent; cursor:pointer; color:#6c7086; font-size:12px; font-weight:600; transition:all 0.15s; font-family:inherit; }
        .md-view-tab.active { background:linear-gradient(135deg,#a78bfa,#60a5fa); color:#fff; }
        .md-view-tab:not(.active):hover { background:#313244; color:#cdd6f4; }
        .md-tab-bar { background:#11111b; border-bottom:1px solid #313244; display:flex; align-items:flex-end; overflow-x:auto; padding:6px 8px 0; gap:2px; scrollbar-width:none; flex-shrink:0; }
        .md-tab-bar::-webkit-scrollbar { display:none; }
        .md-tab { display:flex; align-items:center; gap:6px; padding:6px 12px 6px 14px; background:#1a1a2e; border:1px solid #313244; border-bottom:none; border-radius:7px 7px 0 0; cursor:pointer; font-size:12px; color:#6c7086; transition:background 0.12s, color 0.12s; max-width:180px; user-select:none; }
        .md-tab:hover { background:#252540; color:#a6adc8; }
        .md-tab.active { background:#1e1e2e; color:#cdd6f4; border-color:#45475a; border-bottom-color:#1e1e2e; z-index:1; }
        .md-tab-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:flex; align-items:center; gap:4px; }
        .md-tab-dirty { color:#f9e2af; font-size:10px; }
        .md-tab-close { flex-shrink:0; width:18px; height:18px; border:none; background:transparent; color:#45475a; font-size:14px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.1s; padding:0; }
        .md-tab-close:hover { background:#f38ba822; color:#f38ba8; }
        .md-tab-add { flex-shrink:0; width:28px; height:28px; border:1px dashed #313244; background:transparent; border-radius:7px; cursor:pointer; color:#45475a; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all 0.12s; margin-bottom:1px; margin-left:2px; }
        .md-tab-add:hover { border-color:#a78bfa; color:#a78bfa; background:#a78bfa11; }
        .md-panels { display:flex; flex:1; overflow:hidden; }
        .md-panel { flex:1; display:flex; flex-direction:column; min-width:0; }
        .md-panel.hidden { display:none; }
        /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
        /* 分割中央のリサイズハンドル */
        .md-resizer { width:6px; flex-shrink:0; background:#313244; cursor:col-resize; transition:background .15s; position:relative; }
        .md-resizer:hover { background:#45475a; }
        .md-resizer.dragging { background:#a78bfa; }
        .md-resizer::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:2px; height:32px; background:#6c7086; border-radius:1px; opacity:.5; }
        .md-resizer:hover::after,.md-resizer.dragging::after { opacity:1; background:#cdd6f4; }
        .md-panel-header { padding:8px 20px; background:#181825; border-bottom:1px solid #313244; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#6c7086; display:flex; align-items:center; gap:6px; }
        .md-dot-ind { width:6px; height:6px; border-radius:50%; }
        /* 2026-05-05 claude-opus-4-7 セッションターン数：2 */
        /* リサイザがセパレータ役なので border-right は分割時のみ無効化 */
        #md-panel-editor:not(.split) { border-right:1px solid #313244; }
        #md-panel-editor .md-dot-ind { background:#a78bfa; }
        #md-panel-preview .md-dot-ind { background:#60a5fa; }
        .md-editor-wrap { display:flex; flex:1; overflow:hidden; }
        #md-linenums { background:#181825; color:#45475a; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.8; padding:24px 12px 24px 16px; text-align:right; border-right:1px solid #313244; min-width:52px; overflow:hidden; user-select:none; white-space:pre; }
        #md-textarea { flex:1; background:#1e1e2e; color:#cdd6f4; border:none; outline:none; resize:none; font-family:'JetBrains Mono',monospace; font-size:14px; line-height:1.8; padding:24px 28px; tab-size:2; }
        #md-textarea::placeholder { color:#45475a; }
        #md-textarea::-webkit-scrollbar { width:6px; }
        #md-textarea::-webkit-scrollbar-track { background:#1e1e2e; }
        #md-textarea::-webkit-scrollbar-thumb { background:#45475a; border-radius:3px; }
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
        .md-statusbar { background:#181825; border-top:1px solid #313244; padding:6px 20px; display:flex; align-items:center; gap:16px; font-size:11px; color:#6c7086; flex-shrink:0; }
        .md-statusbar span { display:flex; align-items:center; gap:4px; }
        .md-sep { color:#313244 !important; }
        .md-status-btn { padding:4px 12px; border-radius:6px; border:1px solid #313244; background:transparent; color:#a6adc8; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:inherit; }
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

      <div className="md-shell" onDragOver={handleDragOver} onDrop={handleDrop}>
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
                <span>📋 MDをコピー</span><span className="md-ditem-key">C</span>
              </div>
            </div>
          </div>
          <span className="md-title-center">📄 {currentTab?.name ?? 'untitled.md'}</span>
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
          <div className="md-view-tabs">
            <button className={`md-view-tab${view === 'split' ? ' active' : ''}`} onClick={() => setView('split')}>分割</button>
            <button className={`md-view-tab${view === 'editor' ? ' active' : ''}`} onClick={() => setView('editor')}>編集</button>
            <button className={`md-view-tab${view === 'preview' ? ' active' : ''}`} onClick={() => setView('preview')}>プレビュー</button>
          </div>
        </div>

        {/* タブバー */}
        <div className="md-tab-bar">
          {tabs.map(tab => (
            <div key={tab.id} className={`md-tab${tab.id === activeId ? ' active' : ''}`} onClick={() => switchTab(tab.id)}>
              <span className="md-tab-name">
                {!tab.saved && <span className="md-tab-dirty">●</span>}
                <span dangerouslySetInnerHTML={{ __html: escHtml(tab.name) }} />
              </span>
              <button className="md-tab-close" onClick={e => requestCloseTab(tab.id, e)}>×</button>
            </div>
          ))}
          <button className="md-tab-add" onClick={createTab}>＋</button>
        </div>

        {/* パネル */}
        {/* 2026-05-05 claude-opus-4-7 セッションターン数：2 */}
        {/* 分割時は splitRatio で幅制御、それ以外は flex:1 */}
        <div className="md-panels" ref={panelsRef}>
          <div
            id="md-panel-editor"
            className={`md-panel${view === 'preview' ? ' hidden' : ''}${view === 'split' ? ' split' : ''}`}
            style={view === 'split' ? { flex: `0 0 calc(${splitRatio * 100}% - 3px)` } : undefined}
          >
            <div className="md-panel-header"><span className="md-dot-ind" />Markdown</div>
            <div className="md-editor-wrap">
              <div id="md-linenums" ref={lineNumRef} aria-hidden="true">1</div>
              {/* 2026-05-05 claude-opus-4-7 セッションターン数：1 */}
              {/* 分割モード時、textarea のスクロール比率を preview に反映 */}
              <textarea
                id="md-textarea"
                ref={textareaRef}
                placeholder="Markdownを入力..."
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onScroll={() => {
                  const ta = textareaRef.current;
                  if (!ta) return;
                  if (lineNumRef.current) lineNumRef.current.scrollTop = ta.scrollTop;
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
          {view === 'split' && (
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
            className={`md-panel${view === 'editor' ? ' hidden' : ''}`}
            style={view === 'split' ? { flex: `0 0 calc(${(1 - splitRatio) * 100}% - 3px)` } : undefined}
          >
            <div className="md-panel-header"><span className="md-dot-ind" />Preview</div>
            {/* 2026-05-05 claude-opus-4-7 セッションターン数：1 */}
            {/* 分割モード時、preview のスクロール比率を textarea に反映 */}
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
          </div>
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
          <button id="md-btn-copy" className="md-status-btn" onClick={copyMarkdown}>📋 MDをコピー</button>
          <button id="md-btn-save" className="md-status-btn" onClick={() => saveToFile()}>💾 ファイル保存</button>
        </div>
      </div>

      {/* 未保存クローズダイアログ */}
      {closeDlgId !== null && (
        <div className="md-overlay" onClick={e => { if (e.target === e.currentTarget) setCloseDlgId(null); }}>
          <div className="md-dialog-box">
            <h3>⚠️ 未保存の変更があります</h3>
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

      {/* 絵文字ピッカー (2026-05-04 claude-sonnet-4-6 セッションターン数：6) */}
      {emojiPicker && filteredEmojis.length > 0 && (
        <div ref={emojiPickerDivRef} style={{ position:'fixed', top:emojiPicker.top, left:emojiPicker.left, zIndex:9999, background:'#1e1e2e', border:'1px solid #45475a', borderRadius:'10px', boxShadow:'0 8px 32px rgba(0,0,0,.65)', width:'284px', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'6px 12px', fontSize:'11px', color:'#6c7086', borderBottom:'1px solid #313244', fontFamily:'monospace', letterSpacing:1 }}>:{emojiPicker.query || '…'}</div>
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
    </>
  );
}

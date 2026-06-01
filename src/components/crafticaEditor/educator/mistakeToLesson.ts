// 2026-05-11 14:30:00 claude-opus-4-7[1m] セッションターン数：11
// Phase 10: Runner エラー → 優しい日本語の Lesson に変換
// 設計書: documents/design/craftica-editor-phase-10-mistake-to-lesson.md
//
// 方針:
// - hardcoded regex pattern のみ（AI 不使用、memory `feedback_craftica_ai_quality` + 日次上限ルール準拠）
// - 言語別に pattern を上から順に試し、最初にマッチした Mistake を返す
// - マッチしない場合は null（バナー非表示、stderr 折りたたみのみ）
// - 既存 `Lesson` 型を再利用（lessons.ts と同 UI コンポーネントで描画可能）

import type { PrismLang } from '../core/languageDetection';
import type { Lesson } from '../lessons';

export type Mistake = {
  /** マッチした言語 */
  lang: PrismLang;
  /** エラー分類キー（NameError / SyntaxError / NoMethodError 等） */
  type: string;
  /** 検出元の stderr 引用（先頭 200 文字） */
  rawClue: string;
  /** 教育レイヤーで表示する Lesson */
  lesson: Lesson;
};

interface ErrorPattern {
  type: string;
  regex: RegExp;
  build: (m: RegExpMatchArray) => Lesson;
}

const PY_PATTERNS: ErrorPattern[] = [
  {
    type: 'IndentationError',
    regex: /IndentationError:\s*(expected an indented block|unexpected indent|unindent does not match)/,
    build: () => ({
      emoji: '📐',
      short: 'インデント（字下げ）が合ってないみたい',
      detail: 'Python は字下げで「if や for の中身」を表すよ。半角スペース 4 つで揃えると安心。1 行目と 2 行目で字下げの幅が違ったり、忘れていないか見てみよう。',
      example: 'if x > 0:\n    print("ok")  ← 4 スペースで字下げ',
    }),
  },
  {
    type: 'SyntaxError',
    regex: /SyntaxError:\s*(invalid syntax|unexpected EOF while parsing|EOL while scanning|invalid character)/,
    build: () => ({
      emoji: '✏️',
      short: 'Python の文法ルールに合わない書き方だったよ',
      detail: '`:` の付け忘れ、`(` と `)` の組み合わせ、クォート `"` の閉じ忘れがよくある原因。エラーの上の行を見直してみよう。',
      example: 'if x > 0:  ← コロン忘れずに',
    }),
  },
  {
    type: 'NameError',
    regex: /NameError:\s*name ['"]([\w]+)['"] is not defined/,
    build: (m) => ({
      emoji: '🔍',
      short: `「${m[1]}」という名前を見つけられなかったよ`,
      detail: `\`${m[1]}\` という変数や関数がまだ作られてないか、スペルミスかもしれない。先に \`${m[1]} = ...\` で値を入れてから使ってね。`,
      example: `${m[1]} = 5\nprint(${m[1]})  ← 先に作ってから`,
    }),
  },
  {
    type: 'TypeError',
    regex: /TypeError:\s*(unsupported operand type|unhashable type|can only concatenate|argument of type)/,
    build: () => ({
      emoji: '🔀',
      short: '種類（型）が違うものを混ぜようとしたよ',
      detail: '数字（int）と文字列（str）を `+` で繋ぐと怒られるよ。文字列にしたいなら `str(数字)` で揃えてあげよう。',
      example: 'n = 5\nprint("count: " + str(n))  ← str() で揃える',
    }),
  },
  {
    type: 'ZeroDivisionError',
    regex: /ZeroDivisionError:\s*division by zero/,
    build: () => ({
      emoji: '🚫',
      short: '0 で割ることはできないよ',
      detail: '数学のルール通り、0 で割ると無限になるから Python はエラーにするよ。割る前に 0 でないか if で確認してね。',
      example: 'if y != 0:\n    print(x / y)',
    }),
  },
  {
    type: 'IndexError',
    regex: /IndexError:\s*list index out of range/,
    build: () => ({
      emoji: '📏',
      short: 'リストの「ある場所」を見ようとしたけど、そこに無かった',
      detail: 'リストの長さを超えた番号を指定したみたい。`len(リスト)` で長さを確認してから、その内側を見るようにしよう。',
      example: 'xs = [10, 20, 30]\nprint(xs[0])  ← 0 始まりだよ',
    }),
  },
  {
    type: 'KeyError',
    regex: /KeyError:\s*['"]([^'"]+)['"]/,
    build: (m) => ({
      emoji: '🗝️',
      short: `辞書に「${m[1]}」というキーが無かったよ`,
      detail: `辞書（dict）に \`${m[1]}\` が登録されてないみたい。\`.get("${m[1]}")\` を使うと、無い時は None が返るので安全だよ。`,
      example: `d = {"a": 1}\nprint(d.get("${m[1]}"))  ← None が返る`,
    }),
  },
  {
    type: 'AttributeError',
    regex: /AttributeError:\s*['"]?([\w]+)['"]? object has no attribute ['"]([\w]+)['"]/,
    build: (m) => ({
      emoji: '🧩',
      short: `${m[1]} 型に「${m[2]}」というメソッド/属性は無いよ`,
      detail: `\`${m[1]}\` 型のオブジェクトに \`.${m[2]}\` という機能が見つからなかった。スペルミスか、別の型のメソッドと間違えたかも。`,
      example: '',
    }),
  },
  {
    type: 'ModuleNotFoundError',
    regex: /ModuleNotFoundError:\s*No module named ['"]([\w.]+)['"]/,
    build: (m) => ({
      emoji: '📦',
      short: `「${m[1]}」というモジュールが見つからないよ`,
      // 2026-05-17 13:00:00 claude-opus-4-7[1m] セッションターン数：10 — 「注意してね」→「気をつけてね」（member 萎縮回避・意味保持）
      detail: `Pyodide のブラウザ環境では、追加モジュールは \`micropip\` 経由で別途読み込む必要があるよ。標準モジュール以外は気をつけてね。`,
      example: 'import micropip\nawait micropip.install("requests")',
    }),
  },
  {
    type: 'ValueError',
    regex: /ValueError:\s*(invalid literal for int|could not convert)/,
    build: () => ({
      emoji: '🔢',
      short: '文字列を数字に変換しようとしたけど、できなかったよ',
      detail: '`int("abc")` のように、数字でない文字列を変換しようとするとエラーになる。`.isdigit()` で先にチェックしよう。',
      example: 's = "123"\nif s.isdigit():\n    print(int(s))',
    }),
  },
];

const RB_PATTERNS: ErrorPattern[] = [
  {
    type: 'SyntaxError',
    regex: /(syntax error, unexpected|unexpected end-of-input|unterminated string)/,
    build: () => ({
      emoji: '✏️',
      short: 'Ruby の文法ルールに合わない書き方だったよ',
      detail: '`end` の付け忘れ、`do` と `end` の組み合わせ、クォート `"` の閉じ忘れがよくある原因。エラーの上の行を見直してみよう。',
      example: 'def hello\n  puts "hi"\nend  ← end を忘れずに',
    }),
  },
  {
    type: 'NameError',
    regex: /NameError.*undefined local variable or method [`'](\w+)['`]/,
    build: (m) => ({
      emoji: '🔍',
      short: `「${m[1]}」という名前を見つけられなかったよ`,
      detail: `\`${m[1]}\` という変数やメソッドがまだ無いか、スペルミスかも。先に \`${m[1]} = ...\` で値を入れてから使ってね。`,
      example: `${m[1]} = 10\nputs ${m[1]}`,
    }),
  },
  {
    type: 'NoMethodError',
    regex: /NoMethodError.*undefined method [`'](\w+)['`] for (nil|[\w:]+)/,
    build: (m) => ({
      emoji: '🧩',
      short: m[2] === 'nil' ? `nil（何もない値）に対して「${m[1]}」を呼ぼうとしたよ` : `${m[2]} 型に「${m[1]}」というメソッドは無いよ`,
      detail: m[2] === 'nil'
        ? `変数の中身が \`nil\`（空っぽ）の状態でメソッドを呼ぼうとした。`+
          `\`&.\` を使うと、nil でもエラーにならず nil を返してくれるよ。`
        : `\`${m[2]}\` 型のオブジェクトに \`.${m[1]}\` という機能が見つからなかった。スペルミスか、別の型と間違えたかも。`,
      example: m[2] === 'nil' ? 'name&.upcase  ← nil でも安全' : '',
    }),
  },
  {
    type: 'ZeroDivisionError',
    regex: /ZeroDivisionError:\s*divided by 0/,
    build: () => ({
      emoji: '🚫',
      short: '0 で割ることはできないよ',
      detail: '数学のルール通り、0 で割るとエラーになる。割る前に \`y != 0\` を if で確認してね。',
      example: 'puts x / y if y != 0',
    }),
  },
  {
    type: 'ArgumentError',
    regex: /ArgumentError:\s*wrong number of arguments\s*\(given (\d+), expected (\d+)\)/,
    build: (m) => ({
      emoji: '🎯',
      short: `引数の数が合わないよ（${m[1]} 個渡したけど、${m[2]} 個必要）`,
      detail: 'メソッド定義（def）の `()` の中の数と、呼び出し時の `()` の中の数を合わせてあげよう。',
      example: 'def greet(name, age)\n  ...\nend\ngreet("Tama", 3)  ← 2 個渡す',
    }),
  },
  {
    type: 'TypeError',
    regex: /TypeError:\s*no implicit conversion of (\w+) into (\w+)/,
    build: (m) => ({
      emoji: '🔀',
      short: `${m[1]} を ${m[2]} に勝手に変換できないよ`,
      detail: '種類が違うものを足したり繋いだりすると怒られるよ。`.to_s` で文字列、`.to_i` で整数に揃えてあげよう。',
      example: 'puts "count: " + n.to_s',
    }),
  },
  {
    type: 'LoadError',
    regex: /LoadError:\s*cannot load such file -- (.+)/,
    build: (m) => ({
      emoji: '📦',
      short: `「${m[1]}」という gem を読み込めなかったよ`,
      detail: 'ブラウザ版 CRuby（@ruby/wasm-wasi）は標準 stdlib のみ対応。外部 gem は読み込めないよ。`json` や `set` 等の標準モジュールは使えるよ。',
      example: 'require "json"  ← stdlib なら OK',
    }),
  },
];

const SQL_PATTERNS: ErrorPattern[] = [
  {
    type: 'SQL_NO_TABLE',
    regex: /no such table:\s*(\w+)/i,
    build: (m) => ({
      emoji: '🗄️',
      short: `「${m[1]}」という表（テーブル）が見つからないよ`,
      detail: `\`${m[1]}\` テーブルがデータベースにまだ作られていないみたい。\`CREATE TABLE ${m[1]} (...)\` で先に作るか、テーブル名のスペルを確認してね。`,
      example: `CREATE TABLE ${m[1]} (id INTEGER, name TEXT);`,
    }),
  },
  {
    type: 'SQL_NO_COLUMN',
    regex: /no such column:\s*([\w.]+)/i,
    build: (m) => ({
      emoji: '📋',
      short: `「${m[1]}」という列（カラム）が見つからないよ`,
      detail: 'テーブルにその名前の列が無いみたい。列名のスペルや大文字小文字を確認してね。',
      example: '',
    }),
  },
  {
    type: 'SQL_SYNTAX',
    regex: /near\s+"([^"]+)":\s*syntax error/i,
    build: (m) => ({
      emoji: '✏️',
      short: `「${m[1]}」の近くで文法エラー`,
      detail: 'スペルミス（`SELEC` → `SELECT` 等）、カンマ忘れ、セミコロン位置、クォートの種類（"" でなく \'\'）等を確認してね。',
      example: 'SELECT name FROM users WHERE age > 20;',
    }),
  },
  {
    type: 'SQL_UNIQUE',
    regex: /UNIQUE constraint failed:\s*([\w.]+)/i,
    build: (m) => ({
      emoji: '🔑',
      short: `「${m[1]}」が重複してるよ`,
      detail: 'UNIQUE 制約のついた列に同じ値を 2 回入れようとしたみたい。既に同じ値が DB にあるかも。`INSERT OR IGNORE` や `ON CONFLICT` を使う方法もあるよ。',
      example: '',
    }),
  },
  {
    type: 'SQL_NOT_NULL',
    regex: /NOT NULL constraint failed:\s*([\w.]+)/i,
    build: (m) => ({
      // 2026-05-17 13:00:00 claude-opus-4-7[1m] セッションターン数：10 — ⚠️→💡（Mistake→Lesson の優しい解説トーンに統一・member 萎縮回避）
      emoji: '💡',
      short: `「${m[1]}」は必須項目だよ（NULL 不可）`,
      detail: 'この列は値を必ず入れる必要がある。INSERT 文の列指定と値を見直してね。',
      example: '',
    }),
  },
  {
    type: 'SQL_DATATYPE',
    regex: /datatype mismatch/i,
    build: () => ({
      emoji: '🔀',
      short: '型が合わないよ',
      detail: '数字を入れる列に文字列を入れたか、その逆かも。CREATE TABLE での型定義と INSERT 値の種類を見比べてね。',
      example: '',
    }),
  },
  {
    type: 'SQL_GENERIC',
    regex: /SQLITE_ERROR:/i,
    build: () => ({
      emoji: '🗄️',
      short: 'SQL 文に問題があったよ',
      detail: 'SQLite からエラーが返ってきた。SQL 文を上から順に見直して、テーブル名・列名・キーワードのスペル、`;` のつけ忘れを確認してね。',
      example: '',
    }),
  },
];

function tryPatterns(patterns: ErrorPattern[], lang: PrismLang, stderr: string): Mistake | null {
  for (const p of patterns) {
    const m = stderr.match(p.regex);
    if (m) {
      return {
        lang,
        type: p.type,
        rawClue: stderr.slice(0, 200),
        lesson: p.build(m),
      };
    }
  }
  return null;
}

/**
 * Runner エラーを Lesson に変換。
 * stderr が空、または対象言語がパターン未対応、またはどの pattern もマッチしない場合は null。
 */
export function mistakeToLesson(lang: PrismLang, stderr: string): Mistake | null {
  if (!stderr || !stderr.trim()) return null;
  switch (lang) {
    case 'python': return tryPatterns(PY_PATTERNS, lang, stderr);
    case 'ruby': return tryPatterns(RB_PATTERNS, lang, stderr);
    case 'sql': return tryPatterns(SQL_PATTERNS, lang, stderr);
    default: return null;
  }
}

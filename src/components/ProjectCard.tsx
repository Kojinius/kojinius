import type { CSSProperties, ReactNode } from 'react';
import type { Project } from '@/data/projects';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

// 2026-04-22 claude-sonnet-4-6 セッションターン数：8
// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
function formatPeriod(period: { start: string; end?: string }) {
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-');
    return `${y}年${m}月${d}日`;
  };
  if (!period.end) {
    return `${fmt(period.start)} 〜 開発中`;
  }
  const [sy, sm, sd] = period.start.split('-').map(Number);
  const [ey, em, ed] = period.end.split('-').map(Number);
  const s = new Date(sy, sm - 1, sd);
  const e = new Date(ey, em - 1, ed);
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  let days = e.getDate() - s.getDate();
  if (days < 0) {
    months--;
    days += new Date(ey, em - 1, 0).getDate();
  }
  const duration = months > 0 ? (days > 0 ? `${months}ヶ月 ${days}日` : `${months}ヶ月`) : `${days}日`;
  return `${fmt(period.start)} 〜 ${fmt(period.end)}　開発期間：${duration}`;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  className?: string;
  style?: CSSProperties;
}

const cardClasses = (extra?: string) => cn(
  'group relative block bg-white dark:bg-brown-900/60 rounded-2xl',
  'border border-brown-200 dark:border-brown-800 p-6 sm:p-7',
  'transition-all duration-300 overflow-hidden',
  'hover:shadow-lg hover:shadow-brown-600/8 dark:hover:shadow-brown-950/40',
  'hover:-translate-y-0.5 hover:border-brown-300 dark:hover:border-brown-700',
  'opacity-0 animate-fade-in-up',
  extra,
);

export function ProjectCard({ project, index, className, style }: ProjectCardProps) {
  const content: ReactNode = (
    <>
      {/* 背景番号 */}
      <span className="absolute top-3 right-5 font-display text-5xl font-bold text-brown-100 dark:text-brown-900/80 select-none pointer-events-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* アイコン */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brown-50 dark:bg-brown-800 flex items-center justify-center text-2xl shrink-0">
          {project.emoji}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-brown-800 dark:text-brown-100">
              {project.name}
            </h3>
            <span className="text-brown-400 dark:text-brown-600 opacity-0 group-hover:opacity-60 transition-opacity duration-200 hidden sm:inline">
              →
            </span>
          </div>
          {project.period && (
            <p className="mt-0.5 text-[11px] font-mono text-brown-400 dark:text-brown-500">
              {formatPeriod(project.period)}
            </p>
          )}
          <p className="mt-1.5 text-sm text-brown-500 dark:text-brown-400 leading-relaxed">
            {project.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.map(tech => (
              <span
                key={tech}
                className="text-[11px] font-mono font-medium bg-brown-50 dark:bg-brown-800/80 text-brown-600 dark:text-brown-300 rounded-md px-2.5 py-0.5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (project.external || project.newTab) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer" className={cardClasses(className)} style={style}>
        {content}
      </a>
    );
  }

  return (
    <Link to={project.url} className={cardClasses(className)} style={style}>
      {content}
    </Link>
  );
}

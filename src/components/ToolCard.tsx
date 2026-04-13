import { Link } from "@/i18n/routing";
import type { LocalizedTool } from "@/lib/toolsRegistry";

interface ToolCardProps {
  tool: LocalizedTool;
  locale: string;
}

export default function ToolCard({ tool, locale }: ToolCardProps) {
  return (
    <Link href={`/${tool.slug}`} locale={locale as "en" | "ja"} className="block group">
      <article
        className="tool-card h-full
                   border-l-4 border-l-transparent
                   hover:border-l-accent
                   transition-colors duration-200"
      >
        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {tool.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-primary dark:text-sky group-hover:text-accent transition-colors truncate">
              {tool.title}
            </h2>
            {/* カテゴリバッジ */}
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                             bg-sky/30 text-primary dark:bg-sky/10 dark:text-sky">
              {tool.categoryLabel}
            </span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm text-steel dark:text-sky/60 line-clamp-2">
          {tool.description}
        </p>
      </article>
    </Link>
  );
}

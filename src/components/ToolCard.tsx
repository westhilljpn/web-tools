import Link from "next/link";
import type { Tool } from "@/lib/toolsRegistry";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/${tool.slug}`} className="block group">
      <article className="tool-card h-full hover:shadow-md hover:border-blue-200 transition-all duration-200">
        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {tool.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
              {tool.title}
            </h2>
            {/* カテゴリバッジ */}
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-primary">
              {tool.category}
            </span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {tool.description}
        </p>
      </article>
    </Link>
  );
}

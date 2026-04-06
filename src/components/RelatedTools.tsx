import { Link } from "@/i18n/routing";
import type { LocalizedTool } from "@/lib/toolsRegistry";

interface RelatedToolsProps {
  tools: LocalizedTool[];
  /** セクション見出し（親コンポーネントから渡す） */
  title: string;
  locale: string;
}

export default function RelatedTools({
  tools,
  title,
  locale: _locale,
}: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <ul className="space-y-2">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/${tool.slug}`}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-100
                         hover:border-blue-200 hover:bg-blue-50 transition-all duration-150 group"
            >
              <span className="text-xl" aria-hidden="true">
                {tool.icon}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                {tool.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface Step {
  label: string;
  description: string;
}

interface HowToUseProps {
  steps: Step[];
  /** セクション見出し（親コンポーネントから渡す） */
  title: string;
}

export default function HowToUse({ steps, title }: HowToUseProps) {
  if (steps.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">{title}</h2>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4 items-start">
            {/* ステップ番号 */}
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm
                         font-bold flex items-center justify-center mt-0.5"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">{step.label}</p>
              {step.description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

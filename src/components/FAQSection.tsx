"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  /** セクション見出し（親コンポーネントから渡す） */
  title: string;
}

export default function FAQSection({ faqs, title }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  if (faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight flex items-center gap-3">
        {title}
        <span className="flex-1 h-px bg-sky-soft dark:bg-sky/20" aria-hidden="true" />
      </h2>
      <dl className="space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="tool-card">
              <dt>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex justify-between items-center text-left gap-4
                             font-medium text-primary dark:text-sky
                             hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <span>{faq.question}</span>
                  {/* SVG シェブロン */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`shrink-0 w-4 h-4 text-steel/60 dark:text-sky/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </dt>
              <dd
                id={`faq-answer-${index}`}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "1000px" : "0px" }}
              >
                <p className="mt-3 text-sm text-steel dark:text-sky/60 leading-relaxed">
                  {faq.answer}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

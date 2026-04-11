"use client";

import { useState } from "react";
import SEOHead from "@/components/SEOHead";

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

  // FAQPage 構造化データ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  if (faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <SEOHead jsonLd={faqSchema} />
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">{title}</h2>
      <dl className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="tool-card">
            <dt>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
                className="w-full flex justify-between items-center text-left gap-4
                           font-medium text-gray-900 dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors"
              >
                <span>{faq.question}</span>
                <span
                  className={`shrink-0 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
            </dt>
            {openIndex === index && (
              <dd className="mt-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

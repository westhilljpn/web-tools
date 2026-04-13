"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");
  const tSite = useTranslations("site");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sky/70">
            © {year} {tSite("name")}
          </p>
          <nav className="flex items-center gap-6 text-sm text-sky/70">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <a
              href="mailto:westhilljpn@gmail.com"
              className="hover:text-white transition-colors"
            >
              {t("contact")}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "便利ツール集";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {year} {siteName}
          </p>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              利用規約
            </Link>
            <a
              href="mailto:contact@example.com"
              className="hover:text-primary transition-colors"
            >
              お問い合わせ
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

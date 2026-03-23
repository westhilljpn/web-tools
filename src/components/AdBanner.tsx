// AdSense 広告バナーコンポーネント
// NEXT_PUBLIC_ADSENSE_ENABLED が "true" の場合のみ広告を表示する
// 開発・公開フェーズ中（収益化前）は false のままにしておく

interface AdBannerProps {
  /** 広告スロットの配置場所識別子（将来のスロットID管理用） */
  slot?: string;
  className?: string;
}

export default function AdBanner({ slot: _slot, className }: AdBannerProps) {
  // NEXT_PUBLIC_ADSENSE_ENABLED が "true" 以外の場合は何も表示しない
  if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "true") {
    return null;
  }

  // TODO: AdSense コードをここに実装する
  // 参考: https://support.google.com/adsense/answer/9274025
  return (
    <div className={className}>
      {/* AdSense 広告ユニット */}
    </div>
  );
}

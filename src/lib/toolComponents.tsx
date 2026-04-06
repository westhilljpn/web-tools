// slug → ツールコンポーネントのマップ（dynamic import）
// 新規ツール追加時はここにエントリを追加する

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

// ローディング中プレースホルダー（SSRスケルトン）
const Loading = () => (
  <div className="animate-pulse space-y-3 py-4">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-32 bg-gray-200 rounded" />
  </div>
);

const toolComponentMap: Record<string, ComponentType> = {
  TextCounter: dynamic(() => import("@/tools/TextCounter"), { loading: Loading }),
  JsonFormatter: dynamic(() => import("@/tools/JsonFormatter"), { loading: Loading }),
  Base64Tool: dynamic(() => import("@/tools/Base64Tool"), { loading: Loading }),
  UrlEncode: dynamic(() => import("@/tools/UrlEncode"), { loading: Loading }),
  CaseConverter: dynamic(() => import("@/tools/CaseConverter"), { loading: Loading }),
  QrGenerator: dynamic(() => import("@/tools/QrGenerator"), { loading: Loading }),
  ColorConverter: dynamic(() => import("@/tools/ColorConverter"), { loading: Loading }),
  PasswordGenerator: dynamic(() => import("@/tools/PasswordGenerator"), { loading: Loading }),
  TimestampConverter: dynamic(() => import("@/tools/TimestampConverter"), { loading: Loading }),
  UnitConverter: dynamic(() => import("@/tools/UnitConverter"), { loading: Loading }),
  RegexTester: dynamic(() => import("@/tools/RegexTester"), { loading: Loading }),
  AgeCalculator: dynamic(() => import("@/tools/AgeCalculator"), { loading: Loading }),
};

export default toolComponentMap;

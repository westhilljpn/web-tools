// slug → ツールコンポーネントのマップ
// 新規ツール追加時はここにエントリを追加する

import type { ComponentType } from "react";
import TextCounter from "@/tools/TextCounter";

const toolComponentMap: Record<string, ComponentType> = {
  TextCounter,
};

export default toolComponentMap;

import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // ロケールを検証・正規化
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "ja")) {
    locale = routing.defaultLocale;
  }

  const typedLocale = locale as "en" | "ja";

  // 各メッセージファイルをロケール別に読み込む
  const [
    common,
    textCounter,
    jsonFormatter,
    base64,
    urlEncode,
    caseConverter,
    qrGenerator,
    colorConverter,
    passwordGenerator,
  ] =
    typedLocale === "ja"
      ? await Promise.all([
          import("../messages/ja/common.json"),
          import("../messages/ja/tools/text-counter.json"),
          import("../messages/ja/tools/json-formatter.json"),
          import("../messages/ja/tools/base64.json"),
          import("../messages/ja/tools/url-encode.json"),
          import("../messages/ja/tools/case-converter.json"),
          import("../messages/ja/tools/qr-generator.json"),
          import("../messages/ja/tools/color-converter.json"),
          import("../messages/ja/tools/password-generator.json"),
        ])
      : await Promise.all([
          import("../messages/en/common.json"),
          import("../messages/en/tools/text-counter.json"),
          import("../messages/en/tools/json-formatter.json"),
          import("../messages/en/tools/base64.json"),
          import("../messages/en/tools/url-encode.json"),
          import("../messages/en/tools/case-converter.json"),
          import("../messages/en/tools/qr-generator.json"),
          import("../messages/en/tools/color-converter.json"),
          import("../messages/en/tools/password-generator.json"),
        ]);

  return {
    locale: typedLocale,
    messages: {
      ...common.default,
      "text-counter": textCounter.default,
      "json-formatter": jsonFormatter.default,
      base64: base64.default,
      "url-encode": urlEncode.default,
      "case-converter": caseConverter.default,
      "qr-generator": qrGenerator.default,
      "color-converter": colorConverter.default,
      "password-generator": passwordGenerator.default,
    },
  };
});

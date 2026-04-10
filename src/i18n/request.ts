import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // ロケールを検証・正規化
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "ja")) {
    locale = routing.defaultLocale;
  }

  const typedLocale = locale as "en" | "ja";

  // 各メッセージファイルをロケール別に読み込む（全ツール分）
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
    timestampConverter,
    unitConverter,
    regexTester,
    ageCalculator,
    bmiCalculator,
    loanCalculator,
    pomodoroTimer,
    imageConverter,
    imagesToPdf,
    hashGenerator,
    markdownPreview,
    diffChecker,
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
          import("../messages/ja/tools/timestamp-converter.json"),
          import("../messages/ja/tools/unit-converter.json"),
          import("../messages/ja/tools/regex-tester.json"),
          import("../messages/ja/tools/age-calculator.json"),
          import("../messages/ja/tools/bmi-calculator.json"),
          import("../messages/ja/tools/loan-calculator.json"),
          import("../messages/ja/tools/pomodoro-timer.json"),
          import("../messages/ja/tools/image-converter.json"),
          import("../messages/ja/tools/images-to-pdf.json"),
          import("../messages/ja/tools/hash-generator.json"),
          import("../messages/ja/tools/markdown-preview.json"),
          import("../messages/ja/tools/diff-checker.json"),
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
          import("../messages/en/tools/timestamp-converter.json"),
          import("../messages/en/tools/unit-converter.json"),
          import("../messages/en/tools/regex-tester.json"),
          import("../messages/en/tools/age-calculator.json"),
          import("../messages/en/tools/bmi-calculator.json"),
          import("../messages/en/tools/loan-calculator.json"),
          import("../messages/en/tools/pomodoro-timer.json"),
          import("../messages/en/tools/image-converter.json"),
          import("../messages/en/tools/images-to-pdf.json"),
          import("../messages/en/tools/hash-generator.json"),
          import("../messages/en/tools/markdown-preview.json"),
          import("../messages/en/tools/diff-checker.json"),
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
      "timestamp-converter": timestampConverter.default,
      "unit-converter": unitConverter.default,
      "regex-tester": regexTester.default,
      "age-calculator": ageCalculator.default,
      "bmi-calculator": bmiCalculator.default,
      "loan-calculator": loanCalculator.default,
      "pomodoro-timer": pomodoroTimer.default,
      "image-converter": imageConverter.default,
      "images-to-pdf": imagesToPdf.default,
      "hash-generator": hashGenerator.default,
      "markdown-preview": markdownPreview.default,
      "diff-checker": diffChecker.default,
    },
  };
});

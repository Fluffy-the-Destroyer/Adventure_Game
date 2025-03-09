import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked, {
  languageOptions: { parserOptions: { project: true } },
  rules: {
    "prefer-const": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "no-fallthrough": ["error", { allowEmptyCase: true }],
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-constant-condition": "off",
  },
  files: ["**/*.ts", "**/*.tsx"],
});

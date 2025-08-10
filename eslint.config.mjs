import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable unused variable warnings for development
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Allow any types for now (can be made stricter later)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "off",
      
      // Disable img element warning
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;

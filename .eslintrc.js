module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    sourceType: "module",
    parser: "babel-eslint"
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "prettier/standard",
    "plugin:vue/recommended"
  ],
  plugins: ["vue", "prettier"],
  rules: {
    "prettier/prettier": "error"
  }
};

/** @type {import('prettier').Config} */
module.exports = {
  // 📏 Formateo básico
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // 🎯 Configuración específica para JSX
  jsxSingleQuote: false,

  // 📦 Configuración para diferentes tipos de archivos
  overrides: [
    // 📄 JSON files
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },

    // 📝 Markdown files
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },

    // ⚙️ Configuration files
    {
      files: ['*.config.js', '*.config.ts', '.eslintrc.js'],
      options: {
        printWidth: 120,
        singleQuote: true,
      },
    },

    // 🎨 CSS/SCSS files
    {
      files: ['*.css', '*.scss', '*.sass'],
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },

    // 📱 Package.json
    {
      files: 'package.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
  ],

  // 🔌 Plugins para diferentes tipos de archivos
  plugins: [
    // Comentado hasta que estén disponibles
    // 'prettier-plugin-organize-imports',
    // 'prettier-plugin-tailwindcss', // Debe ser el último
  ],

  // ⚡ Configuraciones adicionales para mejor experiencia
  embeddedLanguageFormatting: 'auto',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  requirePragma: false,
  vueIndentScriptAndStyle: false,

  // 🎯 Parser automático basado en extensión de archivo
  // parser: 'auto', // Prettier lo detecta automáticamente
};
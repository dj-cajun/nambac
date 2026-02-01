import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import tailwind from 'eslint-plugin-tailwindcss'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      'tailwindcss': tailwind,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // [1] 바이브 코딩 방지: 엄격한 코드 구조 제한
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }], // 함수 길이 50줄 제한
      'max-depth': ['error', 3], // 중첩(if/for) 3단계 제한
      'complexity': ['error', 10], // 복잡도 10 제한
      
      // [2] 자동 정리: 미사용 변수 및 임포트 자동 삭제
      'no-unused-vars': 'off', // unused-imports 플러그인에게 위임
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // [3] Tailwind CSS 최적화
      'tailwindcss/classnames-order': 'warn', // 클래스 자동 정렬
      'tailwindcss/no-custom-classname': 'off', // 커스텀 클래스 허용

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]

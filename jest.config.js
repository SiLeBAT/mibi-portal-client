const { defaults: jestNgPreset } = require('jest-preset-angular/presets');
module.exports = {
  globals: {
    'ts-jest': {
      ...jestNgPreset.globals['ts-jest'],
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  preset: "jest-preset-angular",
  roots: ['src'],
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"]
}

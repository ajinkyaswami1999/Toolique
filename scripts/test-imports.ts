import React from 'react';

// We will try importing and checking each developer tool component programmatically
async function testImports() {
  const devTools = [
    'SQLFormatter', 'JSONFormatter', 'Base64Tool', 'JWTDecoder',
    'UUIDGenerator', 'HashGenerator', 'URLEncoderDecoder', 'RegexTester',
    'PasswordGenerator', 'CssBeautifier', 'JsBeautifier', 'JSONValidator',
    'JSONCompare', 'SQLMinifier', 'XMLFormatter', 'YAMLFormatter',
    'HTMLFormatter', 'TimestampConverter', 'CronGenerator', 'LoremIpsumGenerator'
  ];

  console.log("Checking developer tools imports...");

  for (const name of devTools) {
    try {
      const module = await import(`../src/tools/${name}.tsx`);
      const Component = module.default;
      if (typeof Component !== 'function') {
        console.error(`❌ Component ${name} does not export a default React component function!`);
      } else {
        console.log(`✅ Component ${name} loaded successfully.`);
      }
    } catch (err: any) {
      console.error(`❌ Component ${name} failed to import:`, err.message);
    }
  }
}

testImports();

const fs = require('fs');

const fullSnippet = fs.readFileSync('infrastructure_snippet.ts', 'utf8');
let explorerContent = fs.readFileSync('components/LocationExplorer.tsx', 'utf8');

// Replace infrastructure object in LocationExplorer.tsx
const startIdx = explorerContent.indexOf('const infrastructure = {');
const endIdx = explorerContent.indexOf('const categoryDisplayNames: Record<string, string> = {');

if (startIdx !== -1 && endIdx !== -1) {
  explorerContent = explorerContent.substring(0, startIdx) + fullSnippet + '\n' + explorerContent.substring(endIdx);
  fs.writeFileSync('components/LocationExplorer.tsx', explorerContent);
  console.log('Successfully updated LocationExplorer.tsx');
} else {
  console.error('Could not locate replacement bounds in LocationExplorer.tsx');
}

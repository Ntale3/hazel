import { common, createLowlight } from "lowlight"

// Create lowlight instance with common languages
// Common includes: bash, c, cpp, csharp, css, diff, go, graphql, ini, java,
// javascript, json, kotlin, less, lua, makefile, markdown, objectivec, perl,
// php, python, r, ruby, rust, scss, shell, sql, swift, typescript, vbnet,
// wasm, xml, yaml
export const lowlight = createLowlight(common)

// Register additional languages if needed
// import typescript from 'highlight.js/lib/languages/typescript'
// lowlight.register('typescript', typescript)

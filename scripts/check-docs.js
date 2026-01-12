#!/usr/bin/env node
const { execSync } = require('child_process')

function stagedFiles() {
  const out = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  return out.split('\n').filter(Boolean)
}

const staged = stagedFiles()
const codeChanged = staged.some((p) => p.startsWith('src/') || p.startsWith('tests/') || p.startsWith('examples/'))
const docsTouched = staged.includes('ROADMAP.md') || staged.includes('DESIGN_UPDATES.md') || staged.includes('DESIGN.md')

if (codeChanged && !docsTouched) {
  console.error('\nError: You changed source/tests/examples files but did not update ROADMAP.md or DESIGN_UPDATES.md.')
  console.error('Please update design/roadmap notes for this change and stage the doc before committing.\n')
  process.exit(1)
}

process.exit(0)

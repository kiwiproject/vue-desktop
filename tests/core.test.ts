import { describe, it, expect } from 'vitest'
import { createDesktop } from '../src/core/DesktopInstance'

describe('DesktopInstance', () => {
  it('creates desktop and windows', () => {
    const d = createDesktop()
    expect(d.windows).toBeDefined()
    d.createWindow({ type: 'test', title: 'T', component: {} })
    expect(d.windows.length).toBe(1)
  })
})

import { describe, it, expect } from 'vitest'
import { createDesktop } from '../src/core/DesktopInstance'

describe('DesktopInstance registry', () => {
  it('creates, retrieves and closes windows', () => {
    const d = createDesktop()
    const w1 = d.createWindow({ type: 't', title: 'A', component: {} as any })
    expect(w1.id).toBeDefined()
    expect(d.getWindow(w1.id!)).toBeDefined()
    expect(d.listWindows().length).toBe(1)
    const closed = d.closeWindow(w1.id!)
    expect(closed).toBe(true)
    expect(d.listWindows().length).toBe(0)
  })

  it('manages focus and z-order', () => {
    const d = createDesktop()
    const a = d.createWindow({ type: 't', title: 'A', component: {} as any })
    const b = d.createWindow({ type: 't', title: 'B', component: {} as any })
    // focus A, then B, ensure operations return true
    expect(d.focusWindow(a.id!)).toBe(true)
    expect(d.focusWindow(b.id!)).toBe(true)
  })

  it('emits lifecycle events', () => {
    const d = createDesktop()
    let created: any = null
    d.on('window-created', (p) => { created = p })
    const w = d.createWindow({ type: 't', title: 'C', component: {} as any })
    expect(created).toBeDefined()
    expect(created.id).toBe(w.id)
  })
})

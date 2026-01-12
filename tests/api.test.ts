import { describe, it, expect } from 'vitest'
import * as api from '../src'

describe('public API', () => {
  it('exports core modules', () => {
    expect(api).toBeDefined()
    expect(api.createDesktop).toBeDefined()
    expect(api.default).toBeUndefined() // default export not expected at root
  })
})

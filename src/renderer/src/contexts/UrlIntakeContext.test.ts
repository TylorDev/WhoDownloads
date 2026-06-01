import { describe, expect, it } from 'vitest'
import { isEditableTarget } from './UrlIntakeContext'

function target(value: {
  nodeName?: string
  isContentEditable?: boolean
  closest?: (selector: string) => unknown
}): EventTarget {
  return value as EventTarget
}

describe('isEditableTarget', () => {
  it('detects native editable form controls', () => {
    expect(isEditableTarget(target({ nodeName: 'INPUT' }))).toBe(true)
    expect(isEditableTarget(target({ nodeName: 'textarea' }))).toBe(true)
    expect(isEditableTarget(target({ nodeName: 'select' }))).toBe(true)
  })

  it('detects contenteditable targets and descendants inside editable controls', () => {
    expect(isEditableTarget(target({ isContentEditable: true }))).toBe(true)
    expect(isEditableTarget(target({ closest: () => ({}) }))).toBe(true)
  })

  it('ignores non-editable targets', () => {
    expect(isEditableTarget(null)).toBe(false)
    expect(isEditableTarget(target({ nodeName: 'DIV', closest: () => null }))).toBe(false)
  })
})

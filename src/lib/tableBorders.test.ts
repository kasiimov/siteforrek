import { describe, expect, it } from 'vitest'
import { docxBorderSize, isInvisible, strokeColorHex } from './tableBorders'

describe('strokeColorHex', () => {
  it('принимает цвет в том виде, в каком его отдаёт pdf.js', () => {
    expect(strokeColorHex('#bf1a1a')).toBe('BF1A1A')
    expect(strokeColorHex('#000000')).toBe('000000')
    expect(strokeColorHex('1a33cc')).toBe('1A33CC')
  })

  it('игнорирует то, что цветом не является', () => {
    expect(strokeColorHex(undefined)).toBeNull()
    expect(strokeColorHex([0.1, 0.2, 0.3])).toBeNull()
    expect(strokeColorHex('#fff')).toBeNull()
    expect(strokeColorHex('#12345g')).toBeNull()
  })
})

describe('isInvisible', () => {
  it('белый считается невидимым', () => {
    expect(isInvisible('FFFFFF')).toBe(true)
    expect(isInvisible('#fff')).toBe(true)
    expect(isInvisible('000000')).toBe(false)
    expect(isInvisible('F0F0F0')).toBe(false)
  })
})

describe('docxBorderSize', () => {
  it('толщина переводится в 1/8 pt и не бывает меньше 2', () => {
    expect(docxBorderSize(0)).toBe(2)
    expect(docxBorderSize(0.5)).toBe(4)
    expect(docxBorderSize(1)).toBe(8)
  })

  it('нечётные восьмые округляются вверх и есть верхний предел', () => {
    expect(docxBorderSize(1.1)).toBe(10)
    expect(docxBorderSize(100)).toBe(48)
  })
})

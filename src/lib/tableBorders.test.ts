import { describe, expect, it } from 'vitest'
import { cmykToHex, docxBorderSize, grayToHex, isInvisible, rgbToHex } from './tableBorders'

describe('rgbToHex', () => {
  it('чёрный и белый', () => {
    expect(rgbToHex(0, 0, 0)).toBe('000000')
    expect(rgbToHex(1, 1, 1)).toBe('FFFFFF')
  })

  it('серый и произвольный цвет', () => {
    expect(rgbToHex(0.5, 0.5, 0.5)).toBe('808080')
    expect(rgbToHex(0.2, 0.4, 0.6)).toBe('336699')
  })

  it('не выходит за границы диапазона', () => {
    expect(rgbToHex(-1, 2, 0.999)).toBe('00FFFF')
  })
})

describe('grayToHex', () => {
  it('один канал на все три', () => {
    expect(grayToHex(0)).toBe('000000')
    expect(grayToHex(1)).toBe('FFFFFF')
    expect(grayToHex(0.25)).toBe('404040')
  })
})

describe('cmykToHex', () => {
  it('без краски — белый, полный ключ — чёрный', () => {
    expect(cmykToHex(0, 0, 0, 0)).toBe('FFFFFF')
    expect(cmykToHex(0, 0, 0, 1)).toBe('000000')
  })

  it('чистый циан и сумма с ключом', () => {
    expect(cmykToHex(1, 0, 0, 0)).toBe('00FFFF')
    expect(cmykToHex(0, 0, 1, 0.5)).toBe('808000')
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

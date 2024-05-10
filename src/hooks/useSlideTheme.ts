/* eslint-disable max-depth */
import tinycolor from 'tinycolor2'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import type { PresetTheme } from '@/configs/theme'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import Mustache from 'mustache'
import { url2Base64 } from '@/utils/url2Base64'
import { layouts } from '@/mocks/layout'

interface ThemeValueWithArea {
  area: number
  value: string
}

export default () => {
  const slidesStore = useSlidesStore()
  const { slides, currentSlide, theme } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

  // 获取指定幻灯片内的主要主题样式，并以在当中的占比进行排序
  const getSlidesThemeStyles = (slide: Slide | Slide[]) => {
    const slides = Array.isArray(slide) ? slide : [slide]

    const backgroundColorValues: ThemeValueWithArea[] = []
    const themeColorValues: ThemeValueWithArea[] = []
    const fontColorValues: ThemeValueWithArea[] = []
    const fontNameValues: ThemeValueWithArea[] = []

    for (const slide of slides) {
      if (slide.background) {
        if (slide.background.type === 'solid' && slide.background.color) {
          backgroundColorValues.push({ area: 1, value: slide.background.color })
        }
        else if (slide.background.type === 'gradient' && slide.background.gradientColor) {
          backgroundColorValues.push(...slide.background.gradientColor.map(item => ({
            area: 1,
            value: item,
          })))
        }
        else backgroundColorValues.push({ area: 1, value: theme.value.backgroundColor })
      }
      for (const el of slide.elements) {
        const elWidth = el.width
        let elHeight = 0
        if (el.type === 'line') {
          const [startX, startY] = el.start
          const [endX, endY] = el.end
          elHeight = Math.sqrt(Math.pow(Math.abs(startX - endX), 2) + Math.pow(Math.abs(startY - endY), 2))
        }
        else elHeight = el.height
  
        const area = elWidth * elHeight
  
        if (el.type === 'shape' || el.type === 'text') {
          if (el.fill) {
            themeColorValues.push({ area, value: el.fill })
          }

          const text = (el.type === 'shape' ? el.text?.content : el.content) || ''
          if (!text) continue

          const plainText = text.replace(/<[^>]+>/g, '').replace(/\s*/g, '')
          const matchForColor = text.match(/<[^>]+color: .+?<\/.+?>/g)
          const matchForFont = text.match(/<[^>]+font-family: .+?<\/.+?>/g)
  
          let defaultColorPercent = 1
          let defaultFontPercent = 1
  
          if (matchForColor) {
            for (const item of matchForColor) {
              const ret = item.match(/color: (.+?);/)
              if (!ret) continue
              const text = item.replace(/<[^>]+>/g, '').replace(/\s*/g, '')
              const color = ret[1]
              const percentage = text.length / plainText.length
              defaultColorPercent = defaultColorPercent - percentage
              
              fontColorValues.push({
                area: area * percentage,
                value: color,
              })
            }
          }
          if (matchForFont) {
            for (const item of matchForFont) {
              const ret = item.match(/font-family: (.+?);/)
              if (!ret) continue
              const text = item.replace(/<[^>]+>/g, '').replace(/\s*/g, '')
              const font = ret[1]
              const percentage = text.length / plainText.length
              defaultFontPercent = defaultFontPercent - percentage
              
              fontNameValues.push({
                area: area * percentage,
                value: font,
              })
            }
          }
  
          if (defaultColorPercent) {
            const _defaultColor = el.type === 'shape' ? el.text?.defaultColor : el.defaultColor
            const defaultColor = _defaultColor || theme.value.fontColor
            fontColorValues.push({
              area: area * defaultColorPercent,
              value: defaultColor,
            })
          }
          if (defaultFontPercent) {
            const _defaultFont = el.type === 'shape' ? el.text?.defaultFontName : el.defaultFontName
            const defaultFont = _defaultFont || theme.value.fontName
            fontNameValues.push({
              area: area * defaultFontPercent,
              value: defaultFont,
            })
          }
        }
        else if (el.type === 'table') {
          const cellCount = el.data.length * el.data[0].length
          let cellWithFillCount = 0
          for (const row of el.data) {
            for (const cell of row) {
              if (cell.style?.backcolor) {
                cellWithFillCount += 1
                themeColorValues.push({ area: area / cellCount, value: cell.style?.backcolor })
              }
              if (cell.text) {
                const percent = (cell.text.length >= 10) ? 1 : (cell.text.length / 10)
                if (cell.style?.color) {
                  fontColorValues.push({ area: area / cellCount * percent, value: cell.style?.color })
                }
                if (cell.style?.fontname) {
                  fontColorValues.push({ area: area / cellCount * percent, value: cell.style?.fontname })
                }
              }
            }
          }
          if (el.theme) {
            const percent = 1 - cellWithFillCount / cellCount
            themeColorValues.push({ area: area * percent, value: el.theme.color })
          }
        }
        else if (el.type === 'chart') {
          if (el.fill) {
            themeColorValues.push({ area: area * 0.5, value: el.fill })
          }
          themeColorValues.push({ area: area * 0.5, value: el.themeColor[0] })
        }
        else if (el.type === 'line') {
          themeColorValues.push({ area, value: el.color })
        }
        else if (el.type === 'audio') {
          themeColorValues.push({ area, value: el.color })
        }
        else if (el.type === 'latex') {
          fontColorValues.push({ area, value: el.color })
        }
      }
    }
    
    const backgroundColors: { [key: string]: number } = {}
    for (const item of backgroundColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!backgroundColors[color]) backgroundColors[color] = 1
      else backgroundColors[color] += 1
    }

    const themeColors: { [key: string]: number } = {}
    for (const item of themeColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!themeColors[color]) themeColors[color] = item.area
      else themeColors[color] += item.area
    }

    const fontColors: { [key: string]: number } = {}
    for (const item of fontColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!fontColors[color]) fontColors[color] = item.area
      else fontColors[color] += item.area
    }
  
    const fontNames: { [key: string]: number } = {}
    for (const item of fontNameValues) {
      if (!fontNames[item.value]) fontNames[item.value] = item.area
      else fontNames[item.value] += item.area
    }

    return {
      backgroundColors: Object.keys(backgroundColors).sort((a, b) => backgroundColors[b] - backgroundColors[a]),
      themeColors: Object.keys(themeColors).sort((a, b) => themeColors[b] - themeColors[a]),
      fontColors: Object.keys(fontColors).sort((a, b) => fontColors[b] - fontColors[a]),
      fontNames: Object.keys(fontNames).sort((a, b) => fontNames[b] - fontNames[a]),
    }
  }

  // 获取指定幻灯片内所有颜色（主要的）
  const getSlideAllColors = (slide: Slide) => {
    const colors: string[] = []
    for (const el of slide.elements) {
      if (el.type === 'shape' && tinycolor(el.fill).getAlpha() !== 0) {
        const color = tinycolor(el.fill).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
      if (el.type === 'text' && el.fill && tinycolor(el.fill).getAlpha() !== 0) {
        const color = tinycolor(el.fill).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
      if (el.type === 'table' && el.theme && tinycolor(el.theme.color).getAlpha() !== 0) {
        const color = tinycolor(el.theme.color).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
      if (el.type === 'chart' && el.fill && tinycolor(el.fill).getAlpha() !== 0) {
        const color = tinycolor(el.fill).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
      if (el.type === 'line' && tinycolor(el.color).getAlpha() !== 0) {
        const color = tinycolor(el.color).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
      if (el.type === 'audio' && tinycolor(el.color).getAlpha() !== 0) {
        const color = tinycolor(el.color).toRgbString()
        if (!colors.includes(color)) colors.push(color)
      }
    }
    return colors
  }
  
  // 创建原颜色与新颜色的对应关系表
  const createSlideThemeColorMap = (slide: Slide, newColors: string[]): { [key: string]: string } => {
    const oldColors = getSlideAllColors(slide)
    const themeColorMap: { [key: string]: string } = {}
  
    if (oldColors.length > newColors.length) {
      const analogous = tinycolor(newColors[0]).analogous(oldColors.length - newColors.length + 10)
      const otherColors = analogous.map(item => item.toHexString()).slice(1)
      newColors.push(...otherColors)
    }
    for (let i = 0; i < oldColors.length; i++) {
      themeColorMap[oldColors[i]] = newColors[i]
    }
  
    return themeColorMap
  }
  
  // 设置幻灯片主题
  const setSlideTheme = (slide: Slide, theme: PresetTheme) => {
    const colorMap = createSlideThemeColorMap(slide, theme.colors)
  
    // apply theme background
    const defaultBackground = theme.background['default']
    const slideBackground = theme.background[slide.type!]
    if (slideBackground) {
      slide.background = slideBackground
    }
    else {
      slide.background = defaultBackground
    }
    for (const el of slide.elements) {
      if (el.type === 'shape') {
        el.fill = colorMap[tinycolor(el.fill).toRgbString()] || el.fill
        if (el.gradient) delete el.gradient
      }
      if (el.type === 'text') {
        if (el.fill) el.fill = colorMap[tinycolor(el.fill).toRgbString()] || el.fill
        el.defaultColor = theme.fontColor
        el.defaultFontName = theme.fontname
      }
      if (el.type === 'table') {
        if (el.theme) el.theme.color = colorMap[tinycolor(el.theme.color).toRgbString()] || el.theme.color
        for (const rowCells of el.data) {
          for (const cell of rowCells) {
            if (cell.style) {
              cell.style.color = theme.fontColor
              cell.style.fontname = theme.fontname
            }
          }
        }
      }
      if (el.type === 'chart') {
        el.themeColor = [colorMap[tinycolor(el.themeColor[0]).toRgbString()]] || el.themeColor
        el.gridColor = theme.fontColor
      }
      if (el.type === 'line') el.color = colorMap[tinycolor(el.color).toRgbString()] || el.color
      if (el.type === 'audio') el.color = colorMap[tinycolor(el.color).toRgbString()] || el.color
      if (el.type === 'latex') el.color = theme.fontColor
    }
  }
  
  // 应用预置主题（单页）
  const applyPresetThemeToSingleSlide = (theme: PresetTheme) => {
    const newSlide: Slide = JSON.parse(JSON.stringify(currentSlide.value))
    setSlideTheme(newSlide, theme)
    slidesStore.updateSlide({
      background: newSlide.background,
      elements: newSlide.elements,
    })
    addHistorySnapshot()
  }
  
  // 应用预置主题（全部）
  const applyPresetThemeToAllSlides = (theme: PresetTheme) => {
    const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value))
    for (const slide of newSlides) {
      setSlideTheme(slide, theme)
    }
    slidesStore.setTheme({
      background: theme.background,
      themeColor: theme.colors[0],
      fontColor: theme.fontColor,
      fontName: theme.fontname,
    })
    slidesStore.setSlides(newSlides)
    addHistorySnapshot()
  }
  
  // 将当前主题配置应用到全部页面
  const applyThemeToAllSlides = (applyAll = false) => {
    const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value))
    const { themeColor, background, fontColor, fontName, outline, shadow } = theme.value
    const defaultBackground = background['default']
    for (const slide of newSlides) {
      const slideBackground = background[slide.type!]
      if (slideBackground) {
        slide.background = slideBackground
      }
      else {
        slide.background = defaultBackground
      }
  
      for (const el of slide.elements) {
        if (applyAll) {
          if ('outline' in el && el.outline) el.outline = outline
          if ('shadow' in el && el.shadow) el.shadow = shadow
        }

        if (el.type === 'shape') el.fill = themeColor
        else if (el.type === 'line') el.color = themeColor
        else if (el.type === 'text') {
          el.defaultColor = fontColor
          el.defaultFontName = fontName
          if (el.fill) el.fill = themeColor
        }
        else if (el.type === 'table') {
          if (el.theme) el.theme.color = themeColor
          for (const rowCells of el.data) {
            for (const cell of rowCells) {
              if (cell.style) {
                cell.style.color = fontColor
                cell.style.fontname = fontName
              }
            }
          }
        }
        else if (el.type === 'chart') {
          el.themeColor = [themeColor]
          el.gridColor = fontColor
        }
        else if (el.type === 'latex') el.color = fontColor
        else if (el.type === 'audio') el.color = themeColor
      }
    }
    slidesStore.setSlides(newSlides)
    addHistorySnapshot()
  }

  const applyDataToSlide = (slide: Slide, layout: Slide) => {
    slide.elements = []
    slide.background = layout.background
    const contents = slide.data ? slide.data.content : []
    layout.elements.forEach(async element => {
      const copiedObject = JSON.parse(JSON.stringify(element))
      // apply changes
      if ((!copiedObject.groupId || copiedObject.main ) && copiedObject.type === 'placeholder' ) {
        if (copiedObject.accept.includes('heading')) {
          copiedObject.type = 'text'
          copiedObject.content = Mustache.render(copiedObject.template, slide.data)
          slide.elements.push(copiedObject)
        }

        // this part need to be modified
        for (let i = 0; i < contents.length; i++) {
          if (copiedObject.accept.includes(contents[i].type)) {
            if (copiedObject.groupId) {
              // handle it as a group
              const els = JSON.parse(JSON.stringify(layout.elements.filter(el => el.groupId === copiedObject.groupId)))

              // fill data into elements
              if (contents[i].type === 'paragraph') {
                if (contents[i].children) {
                  for (let k = 0 ; k < contents[i].children.length; k++) {
                    const child = contents[i].children[k]
                    for ( let j = 0; j < els.length; j++) {
                      if (!els[j].used && els[j].accept.includes(child.type)) {
                        if (child.type === 'text') {
                          els[j].type = 'text'
                          els[j].used = true
                          els[j].content = Mustache.render('<p>{{#children}}{{literal}}{{/children}}</p>', contents[i])
                          slide.elements.push(els[j])
                        }
                        else if (child.type === 'image') {
                          els[j].type = 'image'
                          els[j].used = true
                          els[j].src = await url2Base64(child.destination)
                          slide.elements.push(els[j])
                          console.log(els[j])
                        }

                        break
                      }
                    }
                  }
                }
              }
              else if (contents[i].type === 'list') {
                if (contents[i].children) {
                  const els2 = els.filter((ele: { accept: string | string[] }) => ele.accept.includes('text'))
                  if (els2 && els2.length > 0) {
                    console.log(contents[i])
                    els2[0].type = 'text'
                    els2[0].content = Mustache.render('<ol>{{#children}}<li>{{#children}}{{#children}}{{literal}}{{/children}}{{/children}}</li>{{/children}}</ol>', contents[i])
                    slide.elements.push(els2[0])
                  }
                }
              }
            }
            else {
              if (contents[i].type === 'paragraph') {
                copiedObject.type = 'text'
                copiedObject.content = Mustache.render('<p>{{#children}}{{literal}}{{/children}}</p>', contents[i])
              }
              else if (contents[i].type === 'list') {
                console.log(contents[i])
                copiedObject.type = 'text'
                copiedObject.content = Mustache.render('<p>{{#children}}{{#children}}{{#children}}{{literal}}{{/children}}{{/children}}{{/children}}</p>', contents[i])
              }
              slide.elements.push(copiedObject)
            }

            contents.splice(i, i)
          }
        }
      }
      else {
        slide.elements.push(copiedObject)
      }
      
    })
  }
  const findBestLayout = (slide: Slide, layouts: Slide[]) => {
    for (const layout of layouts) {
      if (slide.type === layout.type) {
        console.log('slide', slide)
        console.log('layout', layout)
        if ( slide.data.blocks === layout.blocks && slide.data.list === layout.list && slide.data.image === layout.image) {
          return layout
        }
      }
    }
    return null// layouts.filter(f => f.type === slide.type)
  }
  const applyDataToAllSlides = () => {
    const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value))
    const {themeColor, backgroundColor, fontColor, fontName, outline, shadow } = theme.value
    for (const slide of newSlides) {
      if (slide.data) {
        // console.log(tempSlide)
        const layout = findBestLayout(slide, layouts)
        // split to multiple slides according content
        if (layout) {
          applyDataToSlide(slide, layout)
          if (!slide.background || slide.background.type !== 'image') {
            slide.background = {
              type: 'solid',
              color: backgroundColor
            }
          }
      
          for (const el of slide.elements) {  
            if ('outline' in el && el.outline) el.outline = outline
            if ('shadow' in el && el.shadow) el.shadow = shadow
      
            if (el.type === 'shape') el.fill = themeColor
            else if (el.type === 'line') el.color = themeColor
            else if (el.type === 'text') {
              el.defaultColor = fontColor
              el.defaultFontName = fontName
              if (el.fill) el.fill = themeColor
            }
            else if (el.type === 'table') {
              if (el.theme) el.theme.color = themeColor
              for (const rowCells of el.data) {
                for (const cell of rowCells) {
                  if (cell.style) {
                    cell.style.color = fontColor
                    cell.style.fontname = fontName
                  }
                }
              }
            }
            else if (el.type === 'chart') {
              el.themeColor = [themeColor]
              el.gridColor = fontColor
            }
            else if (el.type === 'latex') el.color = fontColor
            else if (el.type === 'audio') el.color = themeColor
          }
    
     
        }
      }
    }
    console.log(newSlides)
    slidesStore.setSlides(newSlides)
    addHistorySnapshot()
  }

  return {
    getSlidesThemeStyles,
    applyPresetThemeToSingleSlide,
    applyPresetThemeToAllSlides,
    applyThemeToAllSlides,
    applyDataToSlide,
    applyDataToAllSlides,
  }
}
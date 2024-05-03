/* eslint-disable max-depth */
import tinycolor from 'tinycolor2'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { PPTPlaceHolder, Slide } from '@/types/slides'
import type { PresetTheme } from '@/configs/theme'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import Mustache from 'mustache'
import { v4 as uuidv4 } from 'uuid'
import { url2Base64 } from '@/utils/url2Base64'

export default () => {
  const slidesStore = useSlidesStore()
  const { slides, currentSlide, theme } = storeToRefs(slidesStore)

  const { addHistorySnapshot } = useHistorySnapshot()

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
  
    if (!slide.background || slide.background.type !== 'image') {
      slide.background = {
        type: 'solid',
        color: theme.background,
      }
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
    // const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value))
    // for (const slide of newSlides) {
    //   setSlideTheme(slide, theme)
    // }
    slidesStore.setTheme({
      backgroundColor: theme.background,
      layouts: theme.layouts,
      themeColor: theme.colors[0],
      fontColor: theme.fontColor,
      fontName: theme.fontname,
    })
    applyDataToAllSlides()
    // slidesStore.setSlides(newSlides)
    // addHistorySnapshot()
  }
  
  // 将当前主题配置应用到全部页面
  const applyThemeToAllSlides = (applyAll = false) => {
    applyDataToAllSlides()
  }

  const splitSlides = (layouts: Slide[], slide: Slide) => {
    // matching layout 
    if (slide.data.content.length > 0) {
      let contents = slide.data.content
      const result = []
      while (contents.length > 0 ) {
        // find max match
        let maxMatch = 0
        let maxLayout = null
        layouts.forEach(layout => {
          let matched = 0
          for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            let found = false
            for (let j = 0; j < layout.elements.length; j++) {
              if (layout.elements[j].type === 'placeholder') {
                const element = layout.elements[j] as PPTPlaceHolder
                if ((!element.groupId || element.main ) && element.accept.includes(content.type)) {
                  found = true
                  break
                }
              }
            }
            if ( found) {
              matched++
            }
            else {
              break
            }
          }
          if (matched > maxMatch) {
            maxMatch = matched
            maxLayout = layout
          }
        })
        if (maxLayout) {
          result.push(
            {
              slide: {
                id: uuidv4(),
                data: null,
                elements: []
              },
              layout: maxLayout,
              contents: contents.slice(0, maxMatch)
            }
          )
          contents = contents.slice(maxMatch)
        }
        else {
          // skip unknow element
          contents = contents.slice(1)
        }
      }
      if (result.length > 0) {
        result[0].slide.data = slide.data
      }
      return result
    }
    
    return [{
      slide: slide,
      layout: layouts[0],
      contents: slide.data.content
    }]
    
  }

  const applyDataToAllSlides = () => {
    const tempSlides: Slide[] = JSON.parse(JSON.stringify(slides.value))
    const {themeColor, backgroundColor, fontColor, fontName, outline, shadow, layouts } = theme.value
    const newSlides: Slide[] = []
    for (const tempSlide of tempSlides) {
      if (tempSlide.data) {
        // console.log(tempSlide)
        const layout = layouts.filter(f => f.type === tempSlide.data.type)
        // split to multiple slides according content
        if (layout && layout.length > 0) {
          const subSlides = splitSlides(layout, tempSlide)
          subSlides.forEach( subSlide => {
            console.log(subSlide)
            const slide = subSlide.slide
            slide.elements = []
            slide.background = subSlide.layout.background
            const contents = subSlide.contents
            subSlide.layout.elements.forEach(async element => {
              const copiedObject = JSON.parse(JSON.stringify(element))
              // apply changes
              if ((!copiedObject.groupId || copiedObject.main ) && copiedObject.type === 'placeholder' ) {
                if (copiedObject.accept.includes('Heading')) {
                  copiedObject.type = 'text'
                  copiedObject.content = Mustache.render(copiedObject.content, slide.data)
                  slide.elements.push(copiedObject)
                }
                else if (copiedObject.accept.includes('TableOfContent')) {
                  copiedObject.type = 'text'
                  copiedObject.content = Mustache.render(copiedObject.content, slide.data)
                  slide.elements.push(copiedObject)
                }
                for (let i = 0; i < contents.length; i++) {
                  if (copiedObject.accept.includes(contents[i].type)) {
                    if (copiedObject.groupId) {
                      // handle it as a group
                      const els = JSON.parse(JSON.stringify(subSlide.layout.elements.filter(el => el.groupId === copiedObject.groupId)))

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
            newSlides.push(slide)
          })

        }
      }
    }
    slidesStore.setSlides(newSlides)
    addHistorySnapshot()
  }

  return {
    applyPresetThemeToSingleSlide,
    applyPresetThemeToAllSlides,
    applyThemeToAllSlides,
    applyDataToAllSlides,
  }
}
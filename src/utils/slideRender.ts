/* eslint-disable no-duplicate-imports */
import type { Slide, SlideTheme } from '@/types/slides'
import type { Node } from 'commonmark'
import { HtmlRenderer } from 'commonmark'
import { uniqueId } from 'lodash'
 
/**
 * 将普通文本转为带段落信息的HTML字符串
 * @param text 文本
 */
export class SlideRenderer {
  theme: SlideTheme | undefined
  writer = new HtmlRenderer()
  constructor(theme?: SlideTheme) {
    this.theme = theme
  }
  render(doc: Node): Slide[] {
    const walker = doc.walker()
    let event
    const slides = [] as any
    let currentSlide
    let slideLevel1: any
    let slideLevel2: any
    while ((event = walker.next())) {
      const node = event.node
      if (event.entering) {
        if (node.type === 'heading') {
          const level = node.level
          if (level === 1) {
            let title = ''
            if ( node.firstChild?.type === 'text') {
              title = this.writer.render(node.firstChild)
            }
            // Start a new slide
            currentSlide = {
              id: uniqueId(),
              title,
              level,
              parent: null,
              content: [] as any,
              children: [] as any
            }
            slides.push(currentSlide)
            slideLevel1 = currentSlide
          } 
          else if (level === 2 && currentSlide) {
            // Start a new sub-slide within the current slide
            let title = ''
            if ( node.firstChild?.type === 'text') {
              title = this.writer.render(node.firstChild)
            }
            if (!slideLevel1) {
              slideLevel1 = currentSlide
            }
            const slide = {
              id: uniqueId(),
              title,
              level,
              parent: slideLevel1,
              content: [],
              children: [] as any
            }

            slideLevel1.children.push(slide)
            currentSlide = slide
            slideLevel2 = slide
            slides.push(currentSlide)
          }
          else if (level === 3 && currentSlide) {
            // Start a new sub-slide within the current slide
            let title = ''
            if ( node.firstChild?.type === 'text') {
              title = this.writer.render(node.firstChild)
            }
            if (!slideLevel2) {
              slideLevel2 = currentSlide
            }
            const slide = {
              id: uniqueId(),
              title,
              level,
              parent: slideLevel2,
              content: [],
              children: [],
            }
            slideLevel2.children.push(slide)
            currentSlide = slide
            slides.push(currentSlide)
          }
        }

        if (currentSlide) {
          currentSlide.content.push(node)
        }
      }
    }
    const list = slides.map( (slide: { id: any }) => {
      return {
        id: slide.id,
        elements: [
          {
            type: 'shape',
            id: 'vSheCJ',
            left: 183.5185185185185,
            top: 175.5092592592593,
            width: 605.1851851851851,
            height: 185.18518518518516,
            viewBox: [200, 200],
            path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
            fill: '#5b9bd5',
            fixedRatio: false,
            rotate: 0
          }, 
          {
            type: 'shape',
            id: 'Mpwv7x',
            left: 211.29629629629628,
            top: 201.80555555555557,
            width: 605.1851851851851,
            height: 185.18518518518516,
            viewBox: [200, 200],
            path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
            fill: '#5b9bd5',
            fixedRatio: false,
            rotate: 0,
            opacity: 0.7
          }, 
          {
            type: 'text',
            id: 'WQOTAp',
            left: 304.9074074074074,
            top: 198.10185185185182,
            width: 417.9629629629629,
            height: 140,
            content: '<p style=\'text-align: center;\'><strong><span style=\'color: #ffffff;\'><span style=\'font-size: 80px\'>感谢观看</span></span></strong></p>',
            rotate: 0,
            defaultFontName: 'Microsoft Yahei',
            defaultColor: '#333',
            wordSpace: 5
          }
        ],
        background: {
          type: 'solid',
          color: '#fff',
        },
      }
    })
    const cover = this.theme?.layouts['cover']
    if (cover) {
      list.unshift(cover)
    }
    const end = this.theme?.layouts['end']
    if (end) {
      list.push(end)
    }
    return list
  
  }

}
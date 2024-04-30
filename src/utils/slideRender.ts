/* eslint-disable no-duplicate-imports */
import type { Slide, SlideTheme } from '@/types/slides'
import type { Node, NodeWalker, NodeWalkingStep } from 'commonmark'
import { HtmlRenderer } from 'commonmark'
import { v4 as uuidv4 } from 'uuid'

interface JsonNode {
  type: string;
  literal?: string | null;
  destination?: string | null;
  title?: string | null;
  children?: JsonNode[];
}

function nodesToJson(node: Node ): JsonNode {

  const result: JsonNode = {
    type: node.type,
    literal: node.literal || null,
    destination: node.destination || null,
    title: node.title || null,
    children: [],
  }

  let child = node.firstChild
  while (child) {
    const childJson: JsonNode | null = nodesToJson(child);
    if (childJson) {
      result.children?.push(childJson)
    }
    child = child.next
  }

  // If the node has no children, we don't need to keep an empty array
  if (result.children?.length === 0) {
    delete result.children
  }

  return result
}

 
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
              id: uuidv4(),
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
              id: uuidv4(),
              title,
              level,
              level1Title: slideLevel1.title,
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
              id: uuidv4(),
              title,
              level,
              level1Title: slideLevel1.title,
              level2Title: slideLevel2.title,
              content: [],
              children: [],
            }
            slideLevel2.children.push(slide)
            currentSlide = slide
            slides.push(currentSlide)
          }
        }

        if (currentSlide) {
          if (node.parent?.type === 'document') {
            currentSlide.content.push(nodesToJson(node))
          }
        }
      }
    }
    const list = slides.map( (slide: { id: number, level: number }) => {
      const layout = this.theme?.layouts[`level${slide.level}`]
      if (layout) {
        const copiedObject = Object.assign({}, layout)
        copiedObject.id = `slide-${slide.id}`
        copiedObject.data = slide
        return copiedObject
      }
      return {
        id: slide.id,
        data: slide,
        elements: []
      }
  
    })
    const toc = this.theme?.layouts['toc']
    if (toc) {
      list.unshift(toc)
    }
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
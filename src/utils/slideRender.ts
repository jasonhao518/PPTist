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
  writer = new HtmlRenderer()
  constructor() {
  }
  render(doc: Node): Slide[] {
    const walker = doc.walker()
    let event
    const slides: Slide[] = []
    let currentSlide
    let slideLevel1: any
    let level1Index = 0
    let level2Index = 0
    let level3Index = 0
    

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
            level1Index++
            level2Index = 0
            level3Index = 0
            
            // Start a new slide
            currentSlide = {
              id: uuidv4(),
              data: {
                type: 'level1',
                index: level1Index,
                title,
                level,
                parent: null,
                content: [] as any,
                children: [] as any
              },
              elements: []
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
            level2Index++
            level3Index = 0
            if (!slideLevel1) {
              slideLevel1 = currentSlide
            }
            const slide = {
              id: uuidv4(),
              data: {
                type: 'level2',
                index: level2Index,
                title,
                level,
                level1Title: slideLevel1.title,
                content: [],
                children: [] as any
              },
              elements: []
            }

            slideLevel1.data.children.push(slide)
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
            level3Index++
            if (!slideLevel2) {
              slideLevel2 = currentSlide
            }
            const slide = {
              id: uuidv4(),
              data: {
                type: 'level3',
                index: level3Index,
                title,
                level,
                level1Title: slideLevel1.title,
                level2Title: slideLevel2.title,
                content: [],
                children: [],
              },
              elements: []
            }
            slideLevel2.data.children.push(slide)
            currentSlide = slide
            slides.push(currentSlide)
          }
        }

        if (currentSlide) {
          if (node.parent?.type === 'document') {
            currentSlide.data.content.push(nodesToJson(node))
          }
        }
      }
    }
    slides.unshift({
      id: uuidv4(),
      data: {
        type: 'toc',
        content: slides.map(slide => { 
          return {level: slide.data.level, index: slide.data.index, title: slide.data.title }
        }),
      },
      elements: []
    })
    slides.unshift({
      id: uuidv4(),
      data: {
        type: 'cover',
        content: [],
      },
      elements: []
    })
    slides.push({
      id: uuidv4(),
      data: {
        type: 'ending',
        content: [],
      },
      elements: []
    })
    return slides
  
  }

}
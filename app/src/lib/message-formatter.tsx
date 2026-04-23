import React from 'react'

function parseInline(text: string, keyPrefix = ''): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let current = ''
  let i = 0
  let key = 0

  while (i < text.length) {
    if (text[i] === '`' && text[i + 1] !== '`') {
      if (current) {
        elements.push(<span key={`${keyPrefix}-${key++}`}>{current}</span>)
        current = ''
      }
      
      let codeContent = ''
      i++
      while (i < text.length && text[i] !== '`') {
        codeContent += text[i]
        i++
      }
      elements.push(
        <code key={`${keyPrefix}-${key++}`} className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-accent">
          {codeContent}
        </code>
      )
      i++
      continue
    }

    if (text[i] === '*' && text[i + 1] === '*') {
      if (current) {
        elements.push(<span key={`${keyPrefix}-${key++}`}>{current}</span>)
        current = ''
      }
      
      let boldContent = ''
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '*')) {
        boldContent += text[i]
        i++
      }
      elements.push(<strong key={`${keyPrefix}-${key++}`} className="font-semibold text-foreground">{boldContent}</strong>)
      i += 2
      continue
    }

    if (text[i] === '*') {
      if (current) {
        elements.push(<span key={`${keyPrefix}-${key++}`}>{current}</span>)
        current = ''
      }
      
      let italicContent = ''
      i++
      while (i < text.length && text[i] !== '*') {
        italicContent += text[i]
        i++
      }
      elements.push(<em key={`${keyPrefix}-${key++}`} className="italic">{italicContent}</em>)
      i++
      continue
    }

    current += text[i]
    i++
  }

  if (current) {
    elements.push(<span key={`${keyPrefix}-${key++}`}>{current}</span>)
  }

  return elements
}

export function formatAIMessage(content: string): React.ReactNode {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let inCodeBlock = false
  let codeBlockContent: string[] = []

  while (i < lines.length) {
    const line = lines[i]
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="mb-3 p-3 bg-muted rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-foreground">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        )
        codeBlockContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      i++
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.match(/^#{1,3}\s/)) {
      const level = line.match(/^#{1,3}/)?.[0].length || 1
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3'
      const headingClass = level === 1 
        ? 'text-2xl font-semibold mb-3 mt-4' 
        : level === 2 
        ? 'text-xl font-semibold mb-2 mt-3' 
        : 'text-lg font-semibold mb-2 mt-2'
      const headingContent = line.replace(/^#{1,3}\s/, '').trim()
      elements.push(
        <HeadingTag key={`heading-${i}`} className={headingClass} style={{ fontFamily: 'Sora, sans-serif' }}>
          {headingContent}
        </HeadingTag>
      )
      i++
      continue
    }

    if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
      const listItems: React.ReactNode[] = []
      const startIndex = i
      while (i < lines.length && (lines[i].match(/^[-*]\s/) || lines[i].match(/^\d+\.\s/))) {
        const itemContent = lines[i].replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '')
        listItems.push(
          <li key={`li-${i}`} className="relative pl-1 before:content-['•'] before:absolute before:-left-4 before:text-accent before:font-bold">
            {parseInline(itemContent, `list-${i}`)}
          </li>
        )
        i++
      }
      elements.push(
        <ul key={`list-${startIndex}`} className="mb-3 space-y-1.5 pl-5">
          {listItems}
        </ul>
      )
      continue
    }

    elements.push(
      <p key={`p-${i}`} className="mb-3 leading-relaxed">
        {parseInline(line, `p-${i}`)}
      </p>
    )
    i++
  }

  return <div className="space-y-0">{elements}</div>
}

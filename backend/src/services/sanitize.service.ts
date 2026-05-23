import sanitizeHtmlLib from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote',
  'img',
  'a',
]

const ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions['allowedAttributes'] = {
  img: ['src', 'alt', 'width', 'height'],
  a: ['href', 'target'],
}

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['https', 'http', 'data'],
    transformTags: {
      img: (tagName, attribs) => {
        const src = attribs['src'] ?? ''
        if (!src.startsWith('/uploads/') && !src.startsWith('https://')) {
          return { tagName: 'span', attribs: {} }
        }
        return { tagName, attribs }
      },
    },
  })
}

export function extractExcerpt(html: string): string {
  const text = sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} })
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= 150) {
    return trimmed
  }
  return trimmed.slice(0, 150) + '...'
}

export function extractCoverUrl(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html)
  return match?.[1] ?? null
}

export const useEmoji = () => {
  const emojis: Record<string, string> = {
    smile: '😄',
    heart: '❤️',
    thumbs_up: '👍',
    fire: '🔥',
    clap: '👏',
    cry: '😢',
  }

  const convertEmojis = (editor: HTMLDivElement) => {
    const sel = window.getSelection()
    const range = sel?.getRangeAt(0)
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null)
    const emojiPattern = /:([a-zA-Z0-9_]+):/g

    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      let match: RegExpExecArray | null
      const matches: { start: number; end: number; emoji: string }[] = []

      while ((match = emojiPattern.exec(node.textContent || ''))) {
        const emoji = emojis[match[1]]
        if (emoji) {
          matches.push({ start: match.index, end: match.index + match[0].length, emoji })
        }
      }

      if (matches.length > 0) {
        let lastIndex = 0
        const parent = node.parentNode!
        const fragment = document.createDocumentFragment()
        let lastInsertedNode: Node | null = null

        matches.forEach(({ start, end, emoji }) => {
          if (lastIndex < start) {
            fragment.appendChild(document.createTextNode(node.textContent!.slice(lastIndex, start)))
          }
          const emojiNode = document.createTextNode(emoji)
          fragment.appendChild(emojiNode)
          lastInsertedNode = emojiNode
          lastIndex = end
        })

        if (lastIndex < node.textContent!.length) {
          fragment.appendChild(document.createTextNode(node.textContent!.slice(lastIndex)))
        }

        parent.replaceChild(fragment, node)

        if (lastInsertedNode && sel && range) {
          const newRange = document.createRange()
          newRange.setStartAfter(lastInsertedNode)
          newRange.collapse(true)
          sel.removeAllRanges()
          sel.addRange(newRange)
        }
      }
    }
  }

  return {
    convertEmojis,
  }
}

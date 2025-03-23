import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { KeyboardEvent } from 'react'

const emojiMap: Record<string, string> = {
  smile: '😄',
  heart: '❤️',
  thumbs_up: '👍',
  fire: '🔥',
  clap: '👏',
  cry: '😢',
}

const EMOJI_REGEX = /:([a-zA-Z0-9_]+):$/

const getTextBeforeCursor = (view: EditorView): { text: string, from: number, to: number } => {
  const { $from } = view.state.selection
  const text = $from.parent.textContent.slice(0, $from.parentOffset)
  return { text, from: $from.start(), to: $from.pos }
}

const insertEmojiIfMatch = (view: EditorView): boolean => {
  const { text, to } = getTextBeforeCursor(view)
  const match = text.match(EMOJI_REGEX)
  if (!match) return false

  const emoji = emojiMap[match[1]]
  if (!emoji) return false

  const startPos = to - match[0].length
  const tr = view.state.tr.insertText(emoji, startPos, to)
  view.dispatch(tr)
  return true
}

export const useEmoji = () =>
  Extension.create({
    name: 'emoji',

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('emoji'),
          props: {
            handleTextInput(view) {
              return insertEmojiIfMatch(view)
            },
            handleDOMEvents: {
              keyup(view: EditorView, event: Event) {
                const keyboardEvent = event as unknown as KeyboardEvent
                if (![':', ' ', 'Enter'].includes(keyboardEvent.key)) return false
                return insertEmojiIfMatch(view)
              },
            },
          },
        }),
      ]
    },
  })

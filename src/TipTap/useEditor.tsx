import { useEditor as useTiptapEditor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import { useEmoji } from './useEmoji'
import { useMention } from './Mention/useMention'

export const useEditor = (onUpdate: () => void) => {
  const Emoji = useEmoji()
  const Mention = useMention()

  return useTiptapEditor({
    extensions: [Document, Text, Paragraph, Emoji, Mention],
    onUpdate,
    content: '<p></p>',
  })
}

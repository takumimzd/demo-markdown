import Mention from '@tiptap/extension-mention'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { SuggestionProps } from '@tiptap/suggestion'

export type User = { id: string; label: string }

const users: User[] = [
  'alice', 'bob', 'charlie', 'david', 'eve', 'frank', 'grace',
  'hannah', 'ian', 'julia', 'kyle', 'linda', 'michael', 'nina',
  'oliver', 'paul', 'quinn', 'rachel', 'steve', 'tina', '神尾',
].map((name, id) => ({ id: `${id}`, label: name }))

const mentionStyle =
  'background: #e0f7fa; color: #00796b; padding: 2px 4px; margin: 0 2px; border-radius: 4px; user-select: none;'

const createSuggestionPopup = () => {
  let popup: TippyInstance
  let currentIndex = 0
  let itemsRef: User[] = []
  let container: HTMLDivElement | null = null
  let currentCommand: ((item: User) => void) | null = null

  const scrollToActiveItem = () => {
    if (!container) return
    const active = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (!active) return

    const itemTop = active.offsetTop
    const itemBottom = itemTop + active.offsetHeight
    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight

    if (itemTop < containerTop) container.scrollTop = itemTop
    else if (itemBottom > containerBottom) container.scrollTop = itemBottom - container.clientHeight
  }

  const renderItems = (items: User[], command: (item: User) => void, activeIndex: number): HTMLDivElement => {
    const el = document.createElement('div')
    el.className = 'tiptap-popover'
    el.style.maxHeight = '180px'
    el.style.overflowY = 'auto'

    items.forEach((item, index) => {
      const div = document.createElement('div')
      div.className = 'tiptap-popover-item'
      div.textContent = `@${item.label}`
      div.setAttribute('data-active', index === activeIndex ? 'true' : 'false')
      if (index === activeIndex) div.style.background = '#e0f2f1'
      div.onclick = () => command(item)
      el.appendChild(div)
    })
    return el
  }

  return {
    onStart: (props: SuggestionProps) => {
      currentIndex = 0
      itemsRef = props.items as User[]
      currentCommand = props.command as (item: User) => void

      container = renderItems(itemsRef, currentCommand, currentIndex)

      popup = tippy(document.body, {
        getReferenceClientRect: props.clientRect
          ? () => props.clientRect!() ?? new DOMRect()
          : undefined,
        content: container,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        appendTo: () => document.body,
      }) as TippyInstance
    },

    onUpdate(props: SuggestionProps) {
      itemsRef = props.items as User[]
      currentCommand = props.command as (item: User) => void
      container = renderItems(itemsRef, currentCommand, currentIndex)
      popup.setContent(container)
    },

    onKeyDown(props: SuggestionProps) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const event = props.event as KeyboardEvent
      if (!itemsRef.length || !currentCommand) return false

      switch (event.key) {
        case 'ArrowDown':
          currentIndex = (currentIndex + 1) % itemsRef.length
          break
        case 'ArrowUp':
          currentIndex = (currentIndex - 1 + itemsRef.length) % itemsRef.length
          break
        case 'Enter':
          currentCommand(itemsRef[currentIndex])
          return true
        default:
          return false
      }

      container = renderItems(itemsRef, currentCommand, currentIndex)
      popup.setContent(container)
      scrollToActiveItem()
      return true
    },

    onExit() {
      popup.destroy()
    },
  }
}

export const useMention = () =>
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
      style: mentionStyle,
    },
    suggestion: {
      char: '@',
      items: ({ query }: { query: string }) => {
        if (typeof query !== 'string') return []
        return users.filter(user =>
          user.label.toLowerCase().startsWith(query.toLowerCase())
        )
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      render: createSuggestionPopup,
    },
  })

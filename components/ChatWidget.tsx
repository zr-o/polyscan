'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react';

type ChatAuthor = 'bot' | 'user';

type ChatMessage = {
  id: number;
  author: ChatAuthor;
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    author: 'bot',
    text: 'Bonjour ! Posez-moi une question financière pour commencer.',
  },
];

const CLAMP_MARGIN = 16;

type Position = { x: number; y: number };
type FloatingPosition = Position | null;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const DEFAULT_POSITION: FloatingPosition = null;

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [position, setPosition] = useState<FloatingPosition>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);

  const messageIdRef = useRef(1);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const chatButtonRef = useRef<HTMLButtonElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const botReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStateRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const draggingRef = useRef(false);

  const clearScheduledReply = useCallback(() => {
    if (botReplyTimeoutRef.current) {
      clearTimeout(botReplyTimeoutRef.current);
      botReplyTimeoutRef.current = null;
    }
  }, []);

  const scrollMessagesToEnd = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, []);

  const focusInput = useCallback(() => {
    const input = chatInputRef.current;
    if (!input) return;

    try {
      input.focus({ preventScroll: true });
    } catch (error) {
      input.focus();
    }
  }, []);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    clearScheduledReply();
    setPosition(DEFAULT_POSITION);
  }, [clearScheduledReply]);

  const handleChatSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const input = chatInputRef.current;
      if (!input) return;

      const value = input.value.trim();
      if (!value) return;

      const nextMessageId = messageIdRef.current++;
      setMessages((prev) => [...prev, { id: nextMessageId, author: 'user', text: value }]);
      input.value = '';

      clearScheduledReply();
      botReplyTimeoutRef.current = setTimeout(() => {
        const replyId = messageIdRef.current++;
        setMessages((prev) => [
          ...prev,
          {
            id: replyId,
            author: 'bot',
            text: "Merci pour votre message. L'IA sera prochainement disponible.",
          },
        ]);
      }, 600);
    },
    [clearScheduledReply]
  );

  useEffect(() => {
    if (!isChatOpen) return;

    const frame = requestAnimationFrame(() => {
      focusInput();
      scrollMessagesToEnd();
    });

    return () => cancelAnimationFrame(frame);
  }, [isChatOpen, focusInput, scrollMessagesToEnd]);

  useEffect(() => {
    if (!isChatOpen) return;
    scrollMessagesToEnd();
  }, [messages, isChatOpen, scrollMessagesToEnd]);

  useEffect(() => {
    const handleExternalOpen = () => openChat();
    window.addEventListener('polyscan-open-chat', handleExternalOpen);
    return () => window.removeEventListener('polyscan-open-chat', handleExternalOpen);
  }, [openChat]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isChatOpen) {
        closeChat();
        chatButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeChat, isChatOpen]);

  useEffect(() => {
    return () => {
      clearScheduledReply();
    };
  }, [clearScheduledReply]);

  const updatePosition = useCallback((left: number, top: number) => {
    const dock = dockRef.current;
    if (!dock) return;

    const rect = dock.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const maxLeft = Math.max(window.innerWidth - width - CLAMP_MARGIN, CLAMP_MARGIN);
    const maxTop = Math.max(window.innerHeight - height - CLAMP_MARGIN, CLAMP_MARGIN);

    const clampedLeft = clamp(left, CLAMP_MARGIN, maxLeft);
    const clampedTop = clamp(top, CLAMP_MARGIN, maxTop);

    setPosition({ x: clampedLeft, y: clampedTop });
  }, []);

  const handleWindowPointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const { offsetX, offsetY } = dragState;
      updatePosition(event.clientX - offsetX, event.clientY - offsetY);
    },
    [updatePosition]
  );

  const handleWindowPointerUp = useCallback(() => {
    dragStateRef.current = null;
    draggingRef.current = false;
    setIsDragging(false);
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);
    window.removeEventListener('pointercancel', handleWindowPointerUp);
  }, [handleWindowPointerMove]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, options: { preventDefault?: boolean } = {}) => {
      if (options.preventDefault) {
        event.preventDefault();
      }

      const dock = dockRef.current;
      if (!dock) return;

      const rect = dock.getBoundingClientRect();
      dragStateRef.current = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      draggingRef.current = true;
      setIsDragging(true);
    setPosition((prev) => (prev ? prev : { x: rect.left, y: rect.top }));

      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerUp);
      window.addEventListener('pointercancel', handleWindowPointerUp);
    },
    [handleWindowPointerMove, handleWindowPointerUp]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [handleWindowPointerMove, handleWindowPointerUp]);

  useEffect(() => {
    if (!position) return;

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;

        const dock = dockRef.current;
        if (!dock) return prev;

        const rect = dock.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const maxLeft = Math.max(window.innerWidth - width - CLAMP_MARGIN, CLAMP_MARGIN);
        const maxTop = Math.max(window.innerHeight - height - CLAMP_MARGIN, CLAMP_MARGIN);

        const nextX = clamp(prev.x, CLAMP_MARGIN, maxLeft);
        const nextY = clamp(prev.y, CLAMP_MARGIN, maxTop);

        if (nextX === prev.x && nextY === prev.y) {
          return prev;
        }

        return { x: nextX, y: nextY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const handleButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (draggingRef.current) {
        event.preventDefault();
        return;
      }

      setIsChatOpen((prev) => !prev);
    },
    []
  );

  const dockClassName = useMemo(() => {
    const classes = ['chat-dock'];
    if (position) {
      classes.push('chat-dock--floating');
    }
    if (isDragging) {
      classes.push('chat-dock--dragging');
    }
    return classes.join(' ');
  }, [isDragging, position]);

  const chatWidgetClassName = useMemo(
    () => `chat-widget${isChatOpen ? ' chat-widget--open' : ''}`,
    [isChatOpen]
  );

  const chatButtonClassName = useMemo(() => {
    const classes = ['chat-button'];
    if (isChatOpen) {
      classes.push('hidden');
    }
    return classes.join(' ');
  }, [isChatOpen]);

  const dockStyle = position
    ? ({ top: `${position.y}px`, left: `${position.x}px`, right: 'auto', bottom: 'auto' } as const)
    : undefined;

  return (
    <div ref={dockRef} className={dockClassName} style={dockStyle} aria-live="polite">
      <div
        className={chatWidgetClassName}
        data-chat
        aria-hidden={isChatOpen ? 'false' : 'true'}
        role="dialog"
        aria-modal="false"
        aria-label="Chatbot financier PolyScan"
      >
        <div className="chat-widget__window">
          <header
            className="chat-widget__header"
            onPointerDown={(event) => startDrag(event, { preventDefault: true })}
          >
            <div className="chat-widget__identity">
              <span aria-hidden="true">🤖</span>
              <div>
                <p className="chat-widget__title">PolyScan Chatbot</p>
                <p className="chat-widget__subtitle">Démo conversationnelle</p>
              </div>
            </div>
            <button
              type="button"
              className="chat-widget__close"
              aria-label="Fermer le chatbot"
              onClick={() => {
                closeChat();
                chatButtonRef.current?.focus();
              }}
            >
              ✕
            </button>
          </header>

          <div className="chat-widget__messages" data-chat-messages ref={chatMessagesRef}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-message chat-message--${message.author}`}>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form className="chat-widget__form" onSubmit={handleChatSubmit}>
            <label className="sr-only" htmlFor="chatbot-input">
              Écrire un message pour le chatbot PolyScan
            </label>
            <input
              id="chatbot-input"
              name="message"
              type="text"
              placeholder="Écrivez votre message..."
              autoComplete="off"
              ref={chatInputRef}
            />
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </div>

      <button
        type="button"
        ref={chatButtonRef}
        className={chatButtonClassName}
        aria-label={isChatOpen ? 'Fermer le chatbot PolyScan' : 'Ouvrir le chatbot PolyScan'}
        aria-haspopup="dialog"
        aria-expanded={isChatOpen}
        onPointerDown={(event) => startDrag(event)}
        onClick={handleButtonClick}
      >
        <img src="/assets/company logos/polyscanchatbot.png" alt="" aria-hidden="true" />
        <span>Chatbot financier</span>
      </button>
    </div>
  );
}

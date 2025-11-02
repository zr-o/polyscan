'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

type CompanyProfileProps = {
  summary: string | null;
  name: string;
};

const splitSummary = (summary: string | null) => {
  if (!summary) return [];
  return summary
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

export default function CompanyProfile({ summary, name }: CompanyProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogBodyId = useId();
  const dialogTitleId = useId();

  const paragraphs = useMemo(() => splitSummary(summary), [summary]);

  const closeDialog = useCallback(() => setIsOpen(false), []);

  const openDialog = useCallback(() => {
    if (!paragraphs.length) return;
    setIsOpen(true);
  }, [paragraphs.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDialog]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      try {
        closeButtonRef.current.focus({ preventScroll: true });
      } catch (error) {
        closeButtonRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!paragraphs.length) {
      setIsOpen(false);
    }
  }, [paragraphs.length]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        closeDialog();
      }
    },
    [closeDialog]
  );

  if (!paragraphs.length) {
    return null;
  }

  return (
    <section className="company-profile" aria-label={`Présentation de ${name}`}>
      <button
        type="button"
        className="company-profile__trigger"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Afficher le profil détaillé de ${name}`}
      >
        <span aria-hidden="true" className="company-profile__dots">
          ...
        </span>
        <span className="company-profile__text">En savoir plus</span>
      </button>

      {isOpen ? (
        <div
          className="company-profile__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogBodyId}
          onClick={handleOverlayClick}
        >
          <div className="company-profile__dialog-content">
            <header className="company-profile__dialog-header">
              <h3 id={dialogTitleId} className="company-profile__dialog-title">
                {name}
              </h3>
              <button
                type="button"
                className="company-profile__close"
                onClick={closeDialog}
                ref={closeButtonRef}
                aria-label="Fermer la description de la société"
              >
                ✕
              </button>
            </header>
            <div id={dialogBodyId} className="company-profile__dialog-body">
              {paragraphs.map((paragraph, index) => (
                <p key={`profile-paragraph-${index}`} className="company-profile__paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

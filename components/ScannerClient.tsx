'use client';

import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';

type AnalysisResult = {
  summary: string;
  exposures: Array<{ sector: string; impact: 'risque' | 'opportunité'; detail: string }>;
  recommendations: string[];
};

const TEXT_EXTENSIONS = [
  'pdf',
  'docx',
  'doc',
  'txt',
  'rtf',
  'html',
  'htm',
  'md',
  'csv',
];

const buildMockAnalysis = (file: File): AnalysisResult => {
  const baseName = file.name.replace(/\.[^.]+$/i, '');
  return {
    summary: `Le document "${baseName}" met en évidence des changements réglementaires touchant principalement les secteurs énergie et infrastructures. Les obligations de conformité augmentent, mais de nouvelles incitations fiscales sont offertes pour les projets verts.`,
    exposures: [
      {
        sector: 'Énergie',
        impact: 'risque',
        detail:
          "Hausse potentielle des coûts de conformité ESG pour les exploitants. Les fournisseurs nord-américains sont les plus exposés.",
      },
      {
        sector: 'Technologies propres',
        impact: 'opportunité',
        detail:
          "Accélération attendue des budgets publics pour l'électrification. Les acteurs spécialisés peuvent prétendre à de nouvelles subventions.",
      },
      {
        sector: 'Transport',
        impact: 'risque',
        detail:
          "Renforcement des seuils d'émissions pour les flottes lourdes d'ici 18 mois, expositions élevées pour les opérateurs logistiques.",
      },
    ],
    recommendations: [
      'Évaluer la marge de manœuvre budgétaire pour absorber les coûts de conformité additionnels.',
      'Identifier les fournisseurs capables de livrer rapidement des solutions bas carbone.',
      'Programmer un suivi trimestriel des décrets d’application liés au projet de loi analysé.',
    ],
  };
};

export default function ScannerClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback((file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setResult(null);
    setError(null);

    window.setTimeout(() => {
      setIsProcessing(false);
      setResult(buildMockAnalysis(file));
    }, 1600);
  }, []);

  const acceptAndAnalyse = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const acceptedFile = Array.from(files).find((item) => {
        const extension = item.name.split('.').pop()?.toLowerCase() ?? '';
        return TEXT_EXTENSIONS.includes(extension);
      });
      if (!acceptedFile) {
        setError("Format non supporté. Importez un document texte (PDF, DOCX, TXT, HTML...).");
        return;
      }
      handleAnalysis(acceptedFile);
    },
    [handleAnalysis]
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      acceptAndAnalyse(event.dataTransfer.files);
    },
    [acceptAndAnalyse]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const fileInfo = useMemo(() => {
    if (!selectedFile) return null;
    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${selectedFile.name} · ${sizeInMb} MB`;
  }, [selectedFile]);

  return (
    <div className="scanner-page">
      <section className="scanner-hero">
        <p className="eyebrow">Analyse réglementaire automatisée</p>
        <h1>Scanner AI PolyScan</h1>
        <p>
          Téléversez un projet de loi ou un rapport réglementaire pour estimer en quelques minutes son
          impact sur vos secteurs, portefeuilles et contreparties.
        </p>
      </section>

      <section className="scanner-upload" aria-label="Zone de scan de documents">
        <label
          className="scanner-dropzone"
          htmlFor="scanner-file-input"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <input
            id="scanner-file-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.html,.htm,.md,.csv"
            onChange={(event) => acceptAndAnalyse(event.target.files)}
          />
          <div className="scanner-dropzone__icon" aria-hidden="true">
            📄
          </div>
          <p className="scanner-dropzone__title">Déposez votre PDF ici</p>
          <p className="scanner-dropzone__subtitle">
            ou <span>parcourir vos fichiers</span> · Taille maximum 25&nbsp;MB
          </p>
          <p className="scanner-dropzone__hint">
            Le scanner détecte les obligations, opportunités de financement et parties prenantes affectées.
          </p>
        </label>

        <div className="scanner-status">
          {fileInfo && <p className="scanner-status__file">Fichier sélectionné&nbsp;: {fileInfo}</p>}
          {isProcessing && <p className="scanner-status__processing">Analyse en cours…</p>}
          {error && <p className="scanner-status__error">{error}</p>}
          {!selectedFile && !isProcessing && !error && (
            <p className="scanner-status__placeholder">
              Aucune analyse en cours. Déposez un document PDF pour lancer le scanner.
            </p>
          )}
        </div>
      </section>

      <section className="scanner-results" aria-live="polite">
        {result ? (
          <div className="scanner-results__content">
            <article className="scanner-card">
              <h2>Aperçu</h2>
              <p>{result.summary}</p>
            </article>

            <article className="scanner-card">
              <h2>Secteurs exposés</h2>
              <ul className="scanner-exposures">
                {result.exposures.map((exposure, index) => (
                  <li
                    key={`${exposure.sector}-${index}`}
                    className={`scanner-exposure scanner-exposure--${exposure.impact}`}
                  >
                    <div>
                      <p className="scanner-exposure__sector">{exposure.sector}</p>
                      <p className="scanner-exposure__detail">{exposure.detail}</p>
                    </div>
                    <span className="scanner-exposure__tag">{exposure.impact}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="scanner-card">
              <h2>Actions suggérées</h2>
              <ul className="scanner-recommendations">
                {result.recommendations.map((rec, index) => (
                  <li key={`rec-${index}`}>{rec}</li>
                ))}
              </ul>
            </article>
          </div>
        ) : (
          <div className="scanner-results__empty">
            {isProcessing ? (
              <p>Nous analysons votre document…</p>
            ) : (
              <p>Les résultats apparaîtront ici après l’analyse de votre PDF.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

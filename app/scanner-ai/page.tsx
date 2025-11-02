export const metadata = {
  title: 'Scanner AI | PolyScan',
};

export default function ScannerPage() {
  return (
    <main className="static-page">
      <section className="static-hero">
        <h1>Scanner AI PolyScan</h1>
        <p>
          Téléversez vos projets de loi ou documents réglementaires et obtenez une analyse automatisée
          des impacts sur vos secteurs, portefeuilles et contreparties.
        </p>
      </section>

      <section className="static-section">
        <div className="static-card">
          <h2>Fonctionnalités clés</h2>
          <ul>
            <li>Analyse sémantique des projets de loi en quelques minutes.</li>
            <li>Identification des entreprises gagnantes et à risque.</li>
            <li>Recommandations concrètes (+ scoring) pour vos analystes.</li>
            <li>Intégration API pour pousser les alertes dans vos outils internes.</li>
          </ul>
        </div>
        <div className="static-card">
          <h2>Démo disponible</h2>
          <p>
            Pour démarrer, contactez notre équipe et planifiez une session privée. Nous adapterons le
            scanner à vos juridictions et sources de données internes.
          </p>
          <a className="btn btn-primary" href="/contactez-nous">
            Planifier une démo
          </a>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container" data-animate>
          <p className="eyebrow">Analyse financière assistée par IA</p>
          <h1>PolyScan oriente vos décisions financières, de la loi au portefeuille.</h1>
          <p className="lead">
            Une plateforme premium qui combine conversation, analyse réglementaire et intelligence
            marché pour transformer l’information en décisions éclairées.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#services">
              Explorer PolyScan
            </a>
            <a className="btn btn-outline" href="#ticker">
              Voir le coverage S&amp;P 500
            </a>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <article className="service container" data-animate>
          <div className="service-grid">
            <div className="service-text">
              <p className="eyebrow">Assistant financier IA</p>
              <h2>Un chatbot qui reste à la disposition de vos analystes 24/7.</h2>
              <p>
                Bot financier ancré dans vos reportings, procédures et recherches internes. Accessible en
                permanence depuis le coin inférieur droit de chaque page, il répond aux questions,
                explique les risques et prépare des résumés prêts à partager.
              </p>
              <div className="pill-row">
                <span className="pill">Chatbot</span>
                <span className="pill">Finance</span>
                <span className="pill">FAQ</span>
                <span className="pill">Multilingue</span>
                <span className="pill">On-call</span>
              </div>
              <button className="btn btn-primary service-action" data-action="chatbot" type="button">
                Commencer
              </button>
            </div>
            <div className="service-media" aria-hidden="true">
              <div className="media-frame">
                <img
                  src="/assets/placeholders/chatbot.jpg"
                  alt="Écran du chatbot financier PolyScan"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </article>

        <article className="service container" data-animate>
          <div className="service-grid service-grid--reverse">
            <div className="service-text">
              <p className="eyebrow">Scanner projet de loi</p>
              <h2>Identifiez en minutes les marchés et compagnies exposés.</h2>
              <p>
                Téléversez le texte d’un projet de loi pour obtenir automatiquement les secteurs impactés,
                les entreprises risquées ou gagnantes, et des recommandations exploitables avec scoring.
              </p>
              <div className="pill-row">
                <span className="pill">NLP</span>
                <span className="pill">Réglementation</span>
                <span className="pill">Impact</span>
                <span className="pill">Alertes</span>
                <span className="pill">Résumé</span>
              </div>
              <a className="btn btn-primary service-action" data-action="scanner" href="/scanner-ai">
                Commencer
              </a>
            </div>
            <div className="service-media" aria-hidden="true">
              <div className="media-frame">
                <img
                  src="/assets/placeholders/law.jpg"
                  alt="Interface du scanner de projet de loi"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </article>

        <article className="service container" data-animate>
          <div className="service-grid">
            <div className="service-text">
              <p className="eyebrow">Vue 360° S&amp;P 500</p>
              <h2>Chaque entreprise sous tous les angles, en temps réel.</h2>
              <p>
                Accédez à une fiche consolidée : cours en direct, résumé exécutif, sentiment du marché,
                fondamentaux, publications 10-K et signaux de risques. Tout ce qui compte pour suivre vos
                positions.
              </p>
              <div className="pill-row">
                <span className="pill">KPIs</span>
                <span className="pill">Sentiment</span>
                <span className="pill">10-K</span>
                <span className="pill">Données temps réel</span>
                <span className="pill">Watchlists</span>
              </div>
              <button className="btn btn-primary service-action" data-action="search" type="button">
                Commencer
              </button>
            </div>
            <div className="service-media" aria-hidden="true">
              <div className="media-frame">
                <img
                  src="/assets/placeholders/finance.jpg"
                  alt="Tableau de bord PolyScan avec indicateurs financiers"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="brands" id="ticker">
        <div className="container">
          <h2 className="brands-title">Compagnies couvertes par notre site</h2>
          <div className="logo-marquee">
            <div className="logo-track">
              <span className="logo-item">
                <img src="/assets/logos/apple.png" alt="Apple" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/microsoft.png" alt="Microsoft" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/tesla.png" alt="Tesla" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/nvidia.png" alt="NVIDIA" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/amazon.png" alt="Amazon" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/google.png" alt="Google" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/meta.png" alt="Meta" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/jpmorgan.png" alt="JPMorgan Chase" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/visa.png" alt="Visa" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/jnj.png" alt="Johnson &amp; Johnson" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/exxon.png" alt="ExxonMobil" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/berkshire.png" alt="Berkshire Hathaway" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/adobe.png" alt="Adobe" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/salesforce.png" alt="Salesforce" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/intel.png" alt="Intel" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/netflix.png" alt="Netflix" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/pepsico.png" alt="PepsiCo" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/cocacola.png" alt="Coca-Cola" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/walmart.png" alt="Walmart" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/bankofamerica.png" alt="Bank of America" />
              </span>

              <span className="logo-item">
                <img src="/assets/logos/apple.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/microsoft.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/tesla.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/nvidia.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/amazon.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/google.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/meta.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/jpmorgan.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/visa.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/jnj.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/exxon.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/berkshire.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/adobe.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/salesforce.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/intel.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/netflix.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/pepsico.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/cocacola.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/walmart.png" alt="" aria-hidden="true" />
              </span>
              <span className="logo-item">
                <img src="/assets/logos/bankofamerica.png" alt="" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

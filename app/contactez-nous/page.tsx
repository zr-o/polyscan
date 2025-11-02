export const metadata = {
  title: 'Contactez-nous | PolyScan',
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-intro">
        <p className="eyebrow">Parlons de vos projets</p>
        <h1>Contactez notre équipe PolyScan</h1>
        <p className="contact-lead">
          Une question sur nos produits ou un besoin de déploiement sur-mesure&nbsp;? Notre équipe est
          disponible 24/7 pour vous guider et vous mettre en route en quelques minutes.
        </p>
      </section>

      <section className="contact-body">
        <form className="contact-form" aria-label="Formulaire pour joindre PolyScan">
          <div className="contact-field-row">
            <label className="contact-field">
              Prénom
              <input type="text" name="firstName" placeholder="Alex" autoComplete="given-name" />
            </label>
            <label className="contact-field">
              Nom
              <input type="text" name="lastName" placeholder="Tremblay" autoComplete="family-name" />
            </label>
          </div>

          <label className="contact-field">
            Courriel professionnel
            <input type="email" name="email" placeholder="vous@entreprise.com" autoComplete="email" />
          </label>

          <div className="contact-field-row">
            <label className="contact-field contact-field--select">
              Pays
              <select name="country" defaultValue="CA">
                <option value="CA">Canada</option>
                <option value="US">États-Unis</option>
                <option value="FR">France</option>
                <option value="GB">Royaume-Uni</option>
              </select>
            </label>
            <label className="contact-field">
              Numéro de téléphone
              <input
                type="tel"
                name="phone"
                placeholder="+1 (514) 555-0000"
                autoComplete="tel"
              />
            </label>
          </div>

          <label className="contact-field">
            Message
            <textarea
              name="message"
              placeholder="Dites-nous comment nous pouvons vous aider..."
              rows={5}
            />
          </label>

          <fieldset className="contact-field contact-services">
            <legend>Services recherchés</legend>
            <div className="contact-services__grid">
              <label>
                <input type="checkbox" name="services" value="deployment" />
                Déploiement personnalisé
              </label>
              <label>
                <input type="checkbox" name="services" value="integration" />
                Intégration API
              </label>
              <label>
                <input type="checkbox" name="services" value="training" />
                Formation analystes
              </label>
              <label>
                <input type="checkbox" name="services" value="compliance" />
                Veille réglementaire
              </label>
              <label>
                <input type="checkbox" name="services" value="support" />
                Support 24/7
              </label>
              <label>
                <input type="checkbox" name="services" value="other" />
                Autre besoin
              </label>
            </div>
          </fieldset>

          <button type="submit" className="contact-submit" disabled>
            Envoyer (démo)
          </button>
        </form>

        <aside className="contact-sidebar" aria-label="Coordonnées PolyScan">
          <div className="contact-sidebar__card">
            <h2>Discuter avec nous</h2>
            <p className="contact-placeholder">Plus tard...</p>
          </div>

          <div className="contact-sidebar__card">
            <h2>Nous appeler</h2>
            <p className="contact-placeholder">Plus tard...</p>
          </div>

          <div className="contact-sidebar__card">
            <h2>Nous rendre visite</h2>
            <p className="contact-placeholder">Plus tard...</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

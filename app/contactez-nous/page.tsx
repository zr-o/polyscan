export const metadata = {
  title: 'Contactez-nous | PolyScan',
};

export default function ContactPage() {
  return (
    <main className="static-page">
      <section className="static-hero">
        <h1>Contactez PolyScan</h1>
        <p>
          Parlons de vos besoins en renseignement financier. Remplissez le formulaire ci-dessous ou
          écrivez-nous directement pour planifier une démonstration.
        </p>
      </section>

      <section className="static-section">
        <div className="static-card">
          <h2>Coordonnées</h2>
          <ul>
            <li>Email : <a href="mailto:hello@polyscan.ai">hello@polyscan.ai</a></li>
            <li>Téléphone : <a href="tel:+15145551234">+1 514-555-1234</a></li>
            <li>Adresse : 2900 Édouard-Montpetit, Montréal (QC)</li>
          </ul>
        </div>
        <div className="static-card">
          <h2>Vous préférez un message ?</h2>
          <form className="static-form">
            <label>
              Nom complet
              <input type="text" name="name" placeholder="Alex Tremblay" required />
            </label>
            <label>
              Courriel professionnel
              <input type="email" name="email" placeholder="alex@entreprise.com" required />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="Décrivez votre projet" required />
            </label>
            <button type="submit" className="btn btn-primary" disabled>
              Envoyer (démo)
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

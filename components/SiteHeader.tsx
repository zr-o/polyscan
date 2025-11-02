export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-left">
          <a className="brand" href="/">
            <img
              className="brand-logo"
              src="/assets/company logos/polyscan.png"
              alt="PolyScan"
            />
          </a>
        </div>
        <div className="header-center">
          <form className="ticker-search" role="search" autoComplete="off">
            <label className="sr-only" htmlFor="ticker-input">
              Rechercher une compagnie du S&amp;P 500
            </label>
            <div className="ticker-search__field">
              <span className="ticker-search__icon" aria-hidden="true">
                🔍
              </span>
              <input
                id="ticker-input"
                name="query"
                type="search"
                placeholder="Rechercher une compagnie S&amp;P 500..."
                aria-autocomplete="list"
                aria-controls="ticker-results"
              />
            </div>
            <ul className="ticker-search__results" id="ticker-results" role="listbox" hidden />
          </form>
        </div>
        <div className="header-right">
          <nav className="site-nav">
            <a href="/scanner-ai">Scanner AI</a>
            <a href="/contactez-nous">Contactez-nous</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

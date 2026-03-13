import { useState } from "react";
import type { Page } from "./types";
import { Layout } from "./components/Layout";
import { RegionsPage } from "./pages/RegionsPage";
import { AnalystsPage } from "./pages/AnalystsPage";
import { HolidaysPage } from "./pages/HolidaysPage";
import { OccurrencesPage } from "./pages/OccurrencesPage";
import { TicketsPage } from "./pages/TicketsPage";
import { ResultsPage } from "./pages/ResultsPage";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState<Page>("results");

  const renderPage = () => {
    switch (activePage) {
      case "regions":
        return <RegionsPage />;
      case "analysts":
        return <AnalystsPage />;
      case "holidays":
        return <HolidaysPage />;
      case "occurrences":
        return <OccurrencesPage />;
      case "tickets":
        return <TicketsPage />;
      case "results":
        return <ResultsPage />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default App;

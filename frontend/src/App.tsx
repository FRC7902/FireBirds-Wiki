import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import { DocumentPage } from '@pages/DocumentPage';
import { SearchPage } from '@pages/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doc/*" element={<DocumentPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;

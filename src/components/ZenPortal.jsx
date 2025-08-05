import React, { useState, useEffect } from 'react';
import { ChevronRight, Home, Calendar, ExternalLink, ArrowLeft, Circle, Moon, Sun } from 'lucide-react';

const ZenInfoPortal = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [articles, setArticles] = useState([]);
  const [dailyArt, setDailyArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load articles
        const articlesResponse = await fetch('/data/articles.json');
        if (!articlesResponse.ok) {
          throw new Error('Failed to load articles');
        }
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);

        // Load daily art
        const artResponse = await fetch('/data/daily-art.json');
        if (!artResponse.ok) {
          throw new Error('Failed to load daily art');
        }
        const artData = await artResponse.json();
        setDailyArt(artData);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        // Fallback to sample data if loading fails
        setArticles(getSampleArticles());
        setDailyArt(getSampleArt());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample data as fallback
  const getSampleArticles = () => [
    {
      id: 1,
      title: "Przykładowy artykuł - dane ładowane z JSON",
      category: "Technologia",
      summary: "Portal jest teraz skonfigurowany do pobierania danych z zewnętrznych plików JSON zamiast hardcoded data.",
      content: "Ten artykuł jest przykładem jak portal będzie wyglądał po implementacji systemu pobierania danych z plików JSON. Wszystkie artykuły będą automatycznie aktualizowane przez GitHub Actions.",
      source: "System",
      date: "2025-08-05",
      priority: "wysoki",
      originalLink: "#"
    }
  ];

  const getSampleArt = () => ({
    title: "Ładowanie dzieła dnia...",
    artist: "System",
    description: "Dzieło artystyczne zostanie załadowane z zewnętrznego pliku JSON.",
    imageUrl: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23f8f9fa'/%3E%3Ctext x='200' y='150' text-anchor='middle' font-family='monospace' font-size='14' fill='%23495057'%3EŁadowanie...%3C/text%3E%3C/svg%3E",
    date: "2025-08-05"
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const categories = [...new Set(articles.map(article => article.category))];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="text-center">
          <div className={`text-2xl font-mono mb-4 ${
            darkMode ? 'text-white' : 'text-black'
          }`}>
            zen-info.pl
          </div>
          <div className={`text-sm font-mono ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ładowanie danych...
          </div>
        </div>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="text-center">
          <div className={`text-2xl font-mono mb-4 ${
            darkMode ? 'text-white' : 'text-black'
          }`}>
            zen-info.pl
          </div>
          <div className={`text-sm font-mono text-red-500 mb-4`}>
            Błąd ładowania: {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className={`text-sm font-mono px-4 py-2 border transition-colors ${
              darkMode 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            odśwież
          </button>
        </div>
      </div>
    );
  }

  const ArticleCard = ({ article, isPreview = true }) => (
    <article className={`border-b py-8 last:border-b-0 ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <header className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs uppercase tracking-wider font-mono ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {article.category}
          </span>
          <div className="flex items-center space-x-2">
            {article.priority === 'wysoki' && (
              <Circle className={`w-2 h-2 ${darkMode ? 'fill-white' : 'fill-black'}`} />
            )}
            <span className={`text-xs font-mono ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {article.source}
            </span>
          </div>
        </div>
        
        <h2 className={`font-semibold leading-tight mb-3 transition-colors ${
          darkMode ? 'text-white' : 'text-black'
        } ${
          isPreview ? `text-xl cursor-pointer ${
            darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'
          }` : 'text-2xl'
        }`}
            onClick={() => isPreview && setSelectedArticle(article)}>
          {article.title}
        </h2>
      </header>
      
      <div className={`leading-relaxed mb-4 ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {isPreview ? article.summary : article.content}
      </div>
      
      <footer className={`flex justify-between items-center text-xs font-mono ${
        darkMode ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <time dateTime={article.date}>
          {new Date(article.date).toLocaleDateString('pl-PL')}
        </time>
        
        <div className="flex items-center space-x-4">
          {isPreview && (
            <button 
              onClick={() => setSelectedArticle(article)}
              className={`transition-colors flex items-center ${
                darkMode ? 'hover:text-white' : 'hover:text-black'

              }`}
            >
              czytaj <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          )}
          <a 
            href={article.originalLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`transition-colors flex items-center ${
              darkMode ? 'hover:text-white' : 'hover:text-black'
            }`}
            title="Źródło oryginalne"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </article>
  );

  const HomePage = () => (
    <div>
      <section>
        {articles
          .sort((a, b) => {
            const priorityOrder = { 'wysoki': 3, 'średni': 2, 'niski': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })
          .map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
      </section>
    </div>
  );

  const VizDniaPage = () => (
    <div>
      <header className={`mb-12 pb-8 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-2xl font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-black'
        }`}>
          viz-dnia
        </h2>
        <p className={`text-sm font-mono ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          dzieło artystyczne • {new Date(dailyArt.date).toLocaleDateString('pl-PL')}
        </p>
      </header>
      
      <article className="max-w-2xl">
        <div className={`mb-8 border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <img 
            src={dailyArt.imageUrl} 
            alt={dailyArt.title}
            className="w-full h-auto"
          />
        </div>
        
        <div className="space-y-4">
          <h3 className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-black'
          }`}>
            {dailyArt.title}
          </h3>
          
          <div className={`text-sm font-mono ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {dailyArt.artist}
          </div>
          
          <p className={`leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {dailyArt.description}
          </p>
        </div>
      </article>
    </div>
  );

  const CategoryPage = ({ category }) => (
    <div>
      <header className={`mb-12 pb-8 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-2xl font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-black'
        }`}>
          {category}
        </h2>
        <p className={`text-sm font-mono ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {articles.filter(article => article.category === category).length} artykułów
        </p>
      </header>
      
      <section>
        {articles
          .filter(article => article.category === category)
          .map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
      </section>
    </div>
  );

  const ArticlePage = ({ article }) => (
    <div>
      <nav className="mb-8">
        <button 
          onClick={() => setSelectedArticle(null)}
          className={`flex items-center transition-colors text-sm font-mono ${
            darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          powrót
        </button>
      </nav>
      
      <ArticleCard article={article} isPreview={false} />
      
      <footer className={`mt-12 pt-8 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`text-xs font-mono space-y-1 ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <p>źródło: {article.source}</p>
          <p>opublikowano: {new Date(article.date).toLocaleDateString('pl-PL')}</p>
        </div>
      </footer>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <header className={`border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                zen-info.pl
              </h1>
              <p className={`text-sm font-mono ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                minimalistyczny portal informacyjny • 
                {new Date().toLocaleDateString('pl-PL')} {new Date().toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-black'
              }`}
              title={darkMode ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`border-b sticky top-0 z-10 transition-colors ${
        darkMode ? 'border-gray-700 bg-black' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex space-x-8 py-4 overflow-x-auto">
            <button
              onClick={() => {setCurrentPage('home'); setSelectedArticle(null);}}
              className={`text-sm font-mono whitespace-nowrap transition-colors ${
                currentPage === 'home' 
                  ? `${darkMode ? 'text-white border-white' : 'text-black border-black'} border-b pb-1`
                  : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`
              }`}
            >
              główna
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {setCurrentPage(category); setSelectedArticle(null);}}
                className={`text-sm font-mono whitespace-nowrap transition-colors ${
                  currentPage === category
                    ? `${darkMode ? 'text-white border-white' : 'text-black border-black'} border-b pb-1`
                    : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`
                }`}
              >
                {category.toLowerCase()} ({articles.filter(a => a.category === category).length})
              </button>
            ))}
            
            <button
              onClick={() => {setCurrentPage('viz-dnia'); setSelectedArticle(null);}}
              className={`text-sm font-mono whitespace-nowrap transition-colors ${
                currentPage === 'viz-dnia' 
                  ? `${darkMode ? 'text-white border-white' : 'text-black border-black'} border-b pb-1`
                  : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`
              }`}
            >
              viz-dnia
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {selectedArticle ? (
          <ArticlePage article={selectedArticle} />
        ) : currentPage === 'home' ? (
          <HomePage />
        ) : currentPage === 'viz-dnia' ? (
          <VizDniaPage />
        ) : (
          <CategoryPage category={currentPage} />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className={`text-xs font-mono ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            automatycznie agregowane • interia, tvn24
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ZenInfoPortal;

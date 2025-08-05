const feedparser = require('feedparser');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

class ZenNewsCollector {
  constructor() {
    this.sources = {
      "Interia": "https://fakty.interia.pl/feed",
      "TVN24": "https://tvn24.pl/najwazniejsze.xml",
      "Gazeta.pl": "https://rss.gazeta.pl/pub/rss/gazetapl_top.xml",
      "Onet": "https://wiadomosci.onet.pl/rss/wiadomosci"
    };
    
    this.categories = {
      "Polityka": ["polityk", "wybory", "rząd", "parlament", "prezydent", "minister", "sejm", "senat"],
      "Gospodarka": ["ekonomia", "biznes", "firma", "bank", "giełda", "inwestycja", "złoty", "euro"],
      "Technologia": ["technologia", "ai", "komputer", "internet", "aplikacja", "smartfon", "cyber"],
      "Sport": ["piłka", "football", "mecz", "liga", "reprezentacja", "sport", "olimpiad", "mundial"],
      "Bezpieczeństwo": ["policja", "wypadek", "przestępst", "sąd", "zatrzyman", "pożar", "awaria"],
      "Edukacja": ["szkoła", "student", "uniwers", "nauka", "badania", "uczniowie", "nauczyciel"],
      "Kultura": ["film", "muzyka", "teatr", "książka", "wystawa", "koncert", "festiwal"],
      "Zdrowie": ["lekarz", "szpital", "pandemia", "szczepion", "choroba", "medycyn", "nfz"]
    };
  }

  async fetchFeed(url) {
    try {
      console.log(`📡 Pobieranie: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZenNewsBot/1.0)'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xml = await response.text();
      
      return new Promise((resolve, reject) => {
        const articles = [];
        const parser = new feedparser();
        
        parser.on('error', reject);
        
        parser.on('readable', function() {
          let item;
          while (item = this.read()) {
            articles.push({
              title: item.title,
              description: item.description || item.summary || '',
              link: item.link,
              date: item.date || new Date(),
              source: item.meta.title || 'Nieznane źródło'
            });
          }
        });
        
        parser.on('end', () => {
          console.log(`✅ Pobrano ${articles.length} artykułów`);
          resolve(articles);
        });
        
        parser.write(xml);
        parser.end();
      });
    } catch (error) {
      console.error(`❌ Błąd pobierania ${url}:`, error.message);
      return [];
    }
  }

  categorizeArticle(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    let bestCategory = 'Różne';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(this.categories)) {
      const score = keywords.reduce((acc, keyword) => 
        acc + (text.includes(keyword) ? 1 : 0), 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .replace(/\n/g, ' ')      // Remove newlines
      .trim();
  }

  generateSummary(description, maxSentences = 2) {
    if (!description) return "Brak opisu artykułu.";
    
    const cleaned = this.cleanText(description);
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, maxSentences).join('. ');
    return summary + (summary.endsWith('.') ? '' : '.');
  }

  calculatePriority(title, description, source) {
    const text = (title + ' ' + description).toLowerCase();
    const urgentWords = ['pilne', 'breaking', 'tragiczny', 'wypadek', 'zmarł', 'zginął', 'atak', 'wybuch'];
    const importantWords = ['prezydent', 'premier', 'rząd', 'parlament', 'wybory', 'sąd'];
    
    let score = 0;
    urgentWords.forEach(word => {
      if (text.includes(word)) score += 3;
    });
    importantWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });

    if (score >= 3) return 'wysoki';
    if (score >= 1) return 'średni';
    return 'niski';
  }

  async collectAllNews() {
    console.log('🚀 Rozpoczynanie zbierania newsów...');
    const allArticles = [];
    let totalCollected = 0;

    for (const [sourceName, url] of Object.entries(this.sources)) {
      console.log(`\n📰 Źródło: ${sourceName}`);
      const articles = await this.fetchFeed(url);
      totalCollected += articles.length;
      
      for (const article of articles.slice(0, 8)) { // Max 8 z każdego źródła
        const processedArticle = {
          id: Date.now() + Math.random(),
          title: this.cleanText(article.title),
          summary: this.generateSummary(article.description),
          content: this.cleanText(article.description),
          category: this.categorizeArticle(article.title, article.description),
          source: sourceName,
          date: article.date.toISOString().split('T')[0],
          priority: this.calculatePriority(article.title, article.description, sourceName),
          originalLink: article.link,
          collectedAt: new Date().toISOString()
        };
        
        allArticles.push(processedArticle);
      }
      
      // Przerwa między źródłami
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 Zebrano łącznie ${totalCollected} artykułów ze wszystkich źródeł`);
    
    // Remove duplicates and sort
    const uniqueArticles = this.removeDuplicates(allArticles);
    const sortedArticles = this.sortArticles(uniqueArticles);
    
    console.log(`✨ Po filtracji: ${sortedArticles.length} unikalnych artykułów`);
    return sortedArticles;
  }

  removeDuplicates(articles) {
    const unique = [];
    const seenTitles = new Set();

    for (const article of articles) {
      const normalizedTitle = article.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50); // Compare first 50 chars
      
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        unique.push(article);
      }
    }

    return unique;
  }

  sortArticles(articles) {
    const priorityOrder = { 'wysoki': 3, 'średni': 2, 'niski': 1 };
    
    return articles.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date
      return new Date(b.collectedAt) - new Date(a.collectedAt);
    }).slice(0, 20); // Keep top 20 articles
  }

  async saveArticles(articles) {
    const dataPath = path.join(__dirname, '../data/articles.json');
    
    // Ensure data directory exists
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    
    await fs.writeFile(dataPath, JSON.stringify(articles, null, 2), 'utf8');
    console.log(`💾 Zapisano ${articles.length} artykułów do ${dataPath}`);
  }

  async updateDailyArt() {
    const artPath = path.join(__dirname, '../data/daily-art.json');
    
    // Simple rotation of art pieces
    const artworks = [
      {
        title: "Kompozycja abstrakcyjna #247",
        artist: "AI Generated",
        description: "Minimalistyczna kompozycja w odcieniach szarości, eksplorująca relacje między przestrzenią a formą.",
        imageUrl: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23f8f9fa'/%3E%3Crect x='50' y='50' width='120' height='80' fill='%23343a40'/%3E%3Ccircle cx='300' cy='150' r='60' fill='%23868e96'/%3E%3Cpath d='M150 200 L250 180 L200 250 Z' fill='%23495057'/%3E%3C/svg%3E"
      },
      {
        title: "Geometryczna harmonia #12",
        artist: "Algorithm Design",
        description: "Prosta gra kolorów i kształtów, inspirowana bauhaus i konstruktywizmem rosyjskim.",
        imageUrl: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23fff'/%3E%3Ccircle cx='100' cy='100' r='40' fill='%23ff6b6b'/%3E%3Crect x='200' y='50' width='80' height='80' fill='%234ecdc4'/%3E%3Cpath d='M300 200 L350 250 L250 250 Z' fill='%23ffe66d'/%3E%3C/svg%3E"
      },
      {
        title: "Medytacja cyfrowa",
        artist: "Neural Network",
        description: "Spokojne płynące formy powstałe w procesie głębokiego uczenia maszynowego.",
        imageUrl: "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23e8f4f8'/%3E%3Cpath d='M50 150 Q200 50 350 150 Q200 250 50 150' fill='%236c5ce7' opacity='0.7'/%3E%3Cpath d='M100 100 Q250 200 350 100' stroke='%23fd79a8' stroke-width='3' fill='none'/%3E%3C/svg%3E"
      }
    ];
    
    // Select artwork based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const selectedArt = artworks[dayOfYear % artworks.length];
    
    const artData = {
      ...selectedArt,
      date: new Date().toISOString().split('T')[0],
      medium: "Grafika cyfrowa",
      dimensions: "400x300px",
      tags: ["abstrakcja", "minimalizm", "art-generative"],
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(artPath, JSON.stringify(artData, null, 2), 'utf8');
    console.log(`🎨 Zaktualizowano dzieło dnia: ${artData.title}`);
  }

  async generateReport(articles) {
    const stats = {
      total: articles.length,
      categories: {},
      sources: {},
      priorities: {},
      updateTime: new Date().toISOString()
    };

    articles.forEach(article => {
      stats.categories[article.category] = (stats.categories[article.category] || 0) + 1;
      stats.sources[article.source] = (stats.sources[article.source] || 0) + 1;
      stats.priorities[article.priority] = (stats.priorities[article.priority] || 0) + 1;
    });

    console.log('\n📈 RAPORT AKTUALIZACJI');
    console.log('═'.repeat(40));
    console.log(`📊 Łącznie artykułów: ${stats.total}`);
    console.log(`⏰ Czas aktualizacji: ${new Date().toLocaleString('pl-PL')}`);
    
    console.log('\n📂 Kategorie:');
    Object.entries(stats.categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));
    
    console.log('\n📰 Źródła:');
    Object.entries(stats.sources)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => console.log(`   ${source}: ${count}`));
    
    console.log('\n🎯 Priorytety:');
    Object.entries(stats.priorities)
      .forEach(([priority, count]) => console.log(`   ${priority}: ${count}`));
  }

  async run() {
    const startTime = Date.now();
    
    try {
      console.log('🌟 ZEN NEWS COLLECTOR v1.0');
      console.log('═'.repeat(40));
      
      const articles = await this.collectAllNews();
      await this.saveArticles(articles);
      await this.updateDailyArt();
      await this.generateReport(articles);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n🎉 Proces zakończony pomyślnie w ${duration}s!`);
      
    } catch (error) {
      console.error('\n❌ BŁĄD KRYTYCZNY:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  const collector = new ZenNewsCollector();
  collector.run();
}

module.exports = ZenNewsCollector;

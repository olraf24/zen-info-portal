# 🌟 zen-info.pl

> Minimalistyczny portal informacyjny z automatyczną aktualizacją treści

## 📖 Opis

zen-info.pl to nowoczesny portal informacyjny, który agreguje najważniejsze wiadomości z Polski i świata w czystej, minimalistycznej formie. Portal automatycznie pobiera treści z RSS feedów i prezentuje je w przejrzysty sposób.

## ✨ Funkcje

- 📰 **Automatyczne pobieranie newsów** - RSS feeds z głównych portali
- 🎨 **Dzieło artystyczne dnia** - codzienna rotacja grafik
- 🌓 **Tryb ciemny/jasny** - przełączanie motywów
- 📱 **PWA Ready** - możliwość instalacji jako aplikacja
- ⚡ **Szybkość** - statyczne pliki, brak bazy danych
- 🔄 **Auto-update** - GitHub Actions co 2 godziny

## 🛠️ Technologie

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js (news collector)
- **Deploy**: GitHub Pages + GitHub Actions
- **Data**: JSON files (statyczne "bazy danych")

## 📁 Struktura projektu

```
zen-info-portal/
├── .github/workflows/     # GitHub Actions
├── public/               # Statyczne pliki
├── src/
│   ├── components/       # Komponenty React
│   ├── data/            # JSON "bazy danych"
│   ├── utils/           # News collector
│   └── styles/          # Style CSS
├── package.json
└── vite.config.js
```

## 🚀 Uruchomienie lokalnie

```bash
# Klonowanie repo
git clone https://github.com/USERNAME/zen-info-portal.git
cd zen-info-portal

# Instalacja zależności
npm install

# Pobranie najnowszych newsów
npm run collect-news

# Uruchomienie dev servera
npm run dev
```

## 📊 GitHub Actions

Automatyczny workflow uruchamia się:
- Co 2 godziny (pobieranie newsów)
- Po każdym push do main
- Można uruchomić ręcznie

```yaml
# .github/workflows/update-news.yml
- Pobiera RSS feeds
- Kategoryzuje artykuły  
- Buduje React app  
- Wdraża na GitHub Pages
```

## 🗃️ Źródła danych

### Artykuły
- Interia (fakty.interia.pl/feed)
- TVN24 (tvn24.pl/najwazniejsze.xml)
- Gazeta.pl (rss.gazeta.pl/pub/rss/gazetapl_top.xml)
- Onet (wiadomosci.onet.pl/rss/wiadomosci)

### Kategoryzacja automatyczna
- Polityka, Gospodarka, Technologia
- Sport, Bezpieczeństwo, Edukacja
- Kultura, Zdrowie

## 🎨 Dzieła artystyczne

Codziennie rotowane grafiki SVG:
- Abstrakcyjne kompozycje
- Generowane algorytmicznie
- Inspirowane sztuką współczesną

## 📱 PWA (Progressive Web App)

Portal można zainstalować jako aplikację:
- Manifest.json
- Service Worker (offline cache)
- Ikony 192x192 i 512x512

## 🌐 Deployment

### GitHub Pages setup:
1. Fork/clone repo
2. Włącz GitHub Pages w Settings
3. Ustaw Custom domain: `zen-info.pl`
4. Skonfiguruj DNS:

```
A Record: zen-info.pl → 185.199.108.153
A Record: zen-info.pl → 185.199.109.153  
A Record: zen-info.pl → 185.199.110.153
A Record: zen-info.pl → 185.199.111.153
CNAME: www.zen-info.pl → USERNAME.github.io
```

## 🔧 Konfiguracja

### News Collector
```javascript
// src/utils/newsCollector.js
this.sources = {
  "Interia": "https://fakty.interia.pl/feed",
  // Dodaj więcej źródeł...
}
```

### Kategoryzacja
```javascript
this.categories = {
  "Polityka": ["polityk", "wybory", "rząd"],
  // Dodaj więcej kategorii...
}
```

## 📈 Monitoring

- GitHub Actions logs
- Build size tracking  
- Health check po deployment
- Error handling z fallback

## 🤝 Contributing

1. Fork projekt
2. Stwórz feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmiany (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## 📞 Kontakt

- Website: [zen-info.pl](https://zen-info.pl)
- Issues: [GitHub Issues](https://github.com/USERNAME/zen-info-portal/issues)

---

**Made with ❤️ for minimalist news consumption**

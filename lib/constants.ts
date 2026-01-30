export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/news", label: "News" },
];

// Sign-up form select options
export const INVESTMENT_GOALS = [
  { value: "Growth", label: "Growth" },
  { value: "Income", label: "Income" },
  { value: "Balanced", label: "Balanced" },
  { value: "Conservative", label: "Conservative" },
];

export const RISK_TOLERANCE_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export const PREFERRED_INDUSTRIES = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Energy", label: "Energy" },
  { value: "Consumer Goods", label: "Consumer Goods" },
];

export const ALERT_TYPE_OPTIONS = [
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
];

export const CONDITION_OPTIONS = [
  { value: "greater", label: "Greater than (>)" },
  { value: "less", label: "Less than (<)" },
];
export const MARKET_OVERVIEW_WIDGET_CONFIG = (
  watchlistSymbols: { s: string; d: string }[] = [],
) => ({
  colorTheme: "dark",
  dateRange: "12M",
  locale: "en",
  largeChartUrl: "",
  isTransparent: true,
  showFloatingTooltip: true,
  plotLineColorGrowing: "#0FEDBE",
  plotLineColorFalling: "#0FEDBE",
  gridLineColor: "rgba(240, 243, 250, 0)",
  scaleFontColor: "#DBDBDB",
  belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
  belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
  belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
  symbolActiveColor: "rgba(15, 237, 190, 0.05)",
  tabs: [
    // This spread operator adds the "My Watchlist" tab ONLY if you have symbols in it
    ...(watchlistSymbols.length > 0
      ? [{ title: "My Watchlist", symbols: watchlistSymbols }]
      : []),
    {
      title: "Financial",
      symbols: [
        { s: "AMEX:SPY", d: "S&P 500 ETF" },
        { s: "NASDAQ:QQQ", d: "NASDAQ 100" },
        { s: "NYSE:V", d: "Visa Inc." },
        { s: "NASDAQ:PYPL", d: "PayPal" },
        { s: "NYSE:BLK", d: "BlackRock" },
        { s: "NYSE:BRK.B", d: "Berkshire Hathaway" },
      ],
    },
    {
      title: "Technology",
      symbols: [
        { s: "NASDAQ:AAPL", d: "Apple" },
        { s: "NASDAQ:GOOGL", d: "Alphabet" },
        { s: "NASDAQ:MSFT", d: "Microsoft" },
        { s: "NASDAQ:META", d: "Meta Platforms" },
        { s: "NYSE:ORCL", d: "Oracle Corp" },
        { s: "NASDAQ:NVDA", d: "NVIDIA" },
        { s: "NASDAQ:AMD", d: "AMD" },
        { s: "NASDAQ:AVGO", d: "Broadcom" },
      ],
    },
    {
      title: "Services",
      symbols: [
        { s: "NASDAQ:AMZN", d: "Amazon" },
        { s: "NASDAQ:HOOD", d: "Robinhood" },
        { s: "NYSE:OSCR", d: "Oscar Health" },
        { s: "NYSE:HIMS", d: "Hims & Hers" },
        { s: "NASDAQ:NFLX", d: "Netflix" },
        { s: "NASDAQ:PLTR", d: "Palantir" },
        { s: "NASDAQ:SOFI", d: "SoFi" },
      ],
    },
  ],
  support_host: "https://www.tradingview.com",
  backgroundColor: "#141414",
  width: "100%",
  height: 600,
  showSymbolLogo: true,
  showChart: true,
});

export const HEATMAP_WIDGET_CONFIG = {
  dataSource: "SPX500",
  blockSize: "market_cap_basic",
  blockColor: "change",
  grouping: "sector",
  isTransparent: true,
  locale: "en",
  symbolUrl: "",
  colorTheme: "dark",
  exchanges: [],
  hasTopBar: false,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isMonoSize: false,
  width: "100%",
  height: "600",
};

export const TOP_STORIES_WIDGET_CONFIG = {
  displayMode: "regular",
  feedMode: "market",
  colorTheme: "dark",
  isTransparent: true,
  locale: "en",
  market: "stock",
  width: "100%",
  height: "600",
};

// MARKET DATA WIDGET - UPDATED TO MATCH YOUR REQUEST
export const MARKET_DATA_WIDGET_CONFIG = {
  title: "Stocks",
  width: "100%",
  height: 600,
  locale: "en",
  showSymbolLogo: true,
  colorTheme: "dark",
  isTransparent: false,
  backgroundColor: "#0F0F0F",
  symbolsGroups: [
    {
      name: "Financial",
      symbols: [
        { name: "ARCA:SPY", displayName: "S&P 500 ETF" },
        { name: "NASDAQ:QQQ", displayName: "NASDAQ 100" },
        { name: "NYSE:V", displayName: "Visa Inc." },
        { name: "NASDAQ:PYPL", displayName: "PayPal" },
        { name: "NYSE:BLK", displayName: "BlackRock" },
        { name: "NYSE:BRK.B", displayName: "Berkshire Hathaway" },
      ],
    },
    {
      name: "Technology",
      symbols: [
        { name: "NASDAQ:AAPL", displayName: "Apple" },
        { name: "NASDAQ:GOOGL", displayName: "Alphabet" },
        { name: "NASDAQ:MSFT", displayName: "Microsoft" },
        { name: "NASDAQ:META", displayName: "Meta Platforms" },
        { name: "NYSE:ORCL", displayName: "Oracle Corp" },
        { name: "NASDAQ:NVDA", displayName: "NVIDIA" },
      ],
    },
    {
      name: "Services",
      symbols: [
        { name: "NASDAQ:AMZN", displayName: "Amazon" },
        { name: "NYSE:BABA", displayName: "Alibaba" },
        { name: "NYSE:T", displayName: "AT&T Inc" },
        { name: "NYSE:WMT", displayName: "Walmart" },
        { name: "NYSE:DIS", displayName: "Disney" },
      ],
    },
  ],
};

export const SYMBOL_INFO_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: "dark",
  isTransparent: true,
  locale: "en",
  width: "100%",
  height: 170,
});

export const CANDLE_CHART_WIDGET_CONFIG = (symbol: string) => ({
  allow_symbol_change: false,
  calendar: false,
  details: true,
  hide_side_toolbar: true,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  hotlist: false,
  interval: "D",
  locale: "en",
  save_image: false,
  style: 1,
  symbol: symbol.toUpperCase(),
  theme: "dark",
  timezone: "Etc/UTC",
  backgroundColor: "#141414",
  gridColor: "#141414",
  watchlist: [],
  withdateranges: false,
  compareSymbols: [],
  studies: [],
  width: "100%",
  height: 600,
});

export const BASELINE_WIDGET_CONFIG = (symbol: string) => ({
  allow_symbol_change: false,
  calendar: false,
  details: false,
  hide_side_toolbar: true,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  hotlist: false,
  interval: "D",
  locale: "en",
  save_image: false,
  style: 10,
  symbol: symbol.toUpperCase(),
  theme: "dark",
  timezone: "Etc/UTC",
  backgroundColor: "#141414",
  gridColor: "#141414",
  watchlist: [],
  withdateranges: false,
  compareSymbols: [],
  studies: [],
  width: "100%",
  height: 600,
});

export const TECHNICAL_ANALYSIS_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: "dark",
  isTransparent: "true",
  locale: "en",
  width: "100%",
  height: 400,
  interval: "1h",
  largeChartUrl: "",
});

export const COMPANY_PROFILE_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: "dark",
  isTransparent: "true",
  locale: "en",
  width: "100%",
  height: 440,
});

export const COMPANY_FINANCIALS_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: "dark",
  isTransparent: "true",
  locale: "en",
  width: "100%",
  height: 464,
  displayMode: "regular",
  largeChartUrl: "",
});

export const POPULAR_STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "NFLX",
  "ORCL",
  "CRM",
  "ADBE",
  "INTC",
  "AMD",
  "PYPL",
  "UBER",
  "ZOOM",
  "SPOT",
  "SQ",
  "SHOP",
  "ROKU",
  "SNOW",
  "PLTR",
  "COIN",
  "RBLX",
  "DDOG",
  "CRWD",
  "NET",
  "OKTA",
  "TWLO",
  "ZM",
  "DOCU",
  "PTON",
  "PINS",
  "SNAP",
  "LYFT",
  "DASH",
  "ABNB",
  "RIVN",
  "LCID",
  "NIO",
  "XPEV",
  "LI",
  "BABA",
  "JD",
  "PDD",
  "TME",
  "BILI",
  "DIDI",
  "GRAB",
  "SE",
];

export const NO_MARKET_NEWS =
  '<p class="mobile-text" style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;">No market news available today. Please check back tomorrow.</p>';

export const WATCHLIST_TABLE_HEADER = [
  "Company",
  "Symbol",
  "Price",
  "Change",
  "Market Cap",
  "P/E Ratio",
  "Alert",
  "Action",
];

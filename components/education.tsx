"use client"

import { useEffect, useState } from "react"

export default function Education() {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedResource, setExpandedResource] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const resources = [
    { 
      id: 1, 
      title: "Market Fundamentals", 
      category: "Core Concepts", 
      icon: "📊",
      detailedContent: {
        introduction: "Market fundamentals form the foundation of successful trading and investment strategies. Understanding these core principles is essential for making informed decisions in financial markets.",
        sections: [
          {
            title: "Understanding Market Structure",
            content: "Markets operate through the interaction of buyers and sellers. Learn about bid-ask spreads, order books, market depth, and how liquidity affects price movements. Understanding market microstructure helps you identify optimal entry and exit points."
          },
          {
            title: "Supply and Demand Dynamics",
            content: "The fundamental law of economics drives all markets. Price moves based on the relationship between supply (sellers) and demand (buyers). When demand exceeds supply, prices rise. When supply exceeds demand, prices fall. Recognizing these imbalances is key to predicting price movements."
          },
          {
            title: "Price Action and Market Sentiment",
            content: "Market sentiment reflects the overall attitude of investors. Understanding fear, greed, and neutral sentiment helps predict market behavior. Price action reveals what the market is actually doing versus what indicators suggest it should do."
          },
          {
            title: "Economic Indicators",
            content: "Key economic data drives market movements: GDP growth, inflation rates (CPI, PPI), employment data, interest rates, and consumer confidence. Central bank policies and their impact on currency valuations are crucial for forex and equity markets."
          },
          {
            title: "Market Cycles and Trends",
            content: "Markets move in cycles: accumulation, markup, distribution, and markdown phases. Identifying which phase you're in helps determine appropriate strategies. Trends can be short-term, intermediate, or long-term. 'The trend is your friend' - trading with the trend increases probability of success."
          },
          {
            title: "Volume Analysis",
            content: "Volume confirms price movements. High volume during uptrends confirms strength; high volume during downtrends confirms weakness. Low volume can indicate lack of conviction or potential reversals. Volume precedes price - smart money shows up in volume before price moves."
          },
          {
            title: "Market Participants",
            content: "Understanding who's trading matters: retail traders, institutional investors, hedge funds, market makers, and algorithmic traders all have different timeframes and objectives. Recognizing their footprints in the market provides edge."
          },
          {
            title: "Correlation and Intermarket Analysis",
            content: "Assets don't trade in isolation. Stock markets correlate with bonds, commodities, and currencies. Understanding these relationships helps predict moves across asset classes. Risk-on vs risk-off sentiment affects global markets simultaneously."
          },
          {
            title: "Time Frames and Multi-Timeframe Analysis",
            content: "Higher timeframes show the bigger picture and major trends. Lower timeframes provide precise entry and exit points. Successful traders align multiple timeframes to ensure their trades match the overall market direction."
          },
          {
            title: "Key Principles to Remember",
            content: "• Markets discount future expectations, not current news\n• Price is the ultimate truth - it reflects all known information\n• Markets can remain irrational longer than you can remain solvent\n• Risk management is more important than being right\n• Consistency beats home runs - focus on repeatable processes\n• Markets reward patience and discipline, not impulsiveness"
          }
        ],
        conclusion: "Mastering market fundamentals takes time and practice. These principles apply across all markets - stocks, forex, crypto, commodities. Build your foundation strong, and advanced strategies will be easier to implement. The best traders never stop learning the basics."
      }
    },
    { id: 2, title: "Technical Analysis Mastery", category: "Advanced Techniques", icon: "📈" },
    { id: 3, title: "Risk Management Frameworks", category: "Portfolio Strategy", icon: "🛡️" },
    { id: 4, title: "Macroeconomic Analysis", category: "Market Research", icon: "🌐" },
    { id: 5, title: "Derivatives Trading", category: "Advanced Instruments", icon: "💰" },
    { id: 6, title: "Algorithmic Trading Basics", category: "Modern Methods", icon: "🤖" },
  ]

  return (
    <section className="relative bg-background py-16 sm:py-24 lg:py-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 space-y-3 sm:space-y-4 animate-fadeInUp">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">Education & Resources</h2>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Comprehensive training materials for continuous professional development
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <div
              key={resource.id}
              className="group relative animate-fadeInUp hover-lift"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div
                className="relative rounded-xl p-8 transition-all duration-300"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
              >
                <div className="mb-4 text-4xl">{resource.icon}</div>
                <div className="mb-4 inline-block">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{resource.category}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-6">{resource.title}</h3>
                <div className="pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                  <button 
                    onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    {expandedResource === resource.id ? "Show Less ↑" : "Learn More →"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Content Modal/Expansion */}
        {expandedResource === 1 && resources[0].detailedContent && (
          <div className="mt-12 animate-fadeInUp">
            <div 
              className="rounded-2xl p-8 md:p-12"
              style={{ border: "2px solid var(--primary)", backgroundColor: "var(--card)" }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-foreground mb-4">Market Fundamentals - Complete Guide</h3>
                  <p className="text-lg text-foreground/80 max-w-3xl">
                    {resources[0].detailedContent?.introduction}
                  </p>
                </div>
                <button 
                  onClick={() => setExpandedResource(null)}
                  className="text-foreground/60 hover:text-foreground transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-8">
                {resources[0].detailedContent?.sections.map((section, idx) => (
                  <div key={idx} className="pb-6" style={{ borderBottom: idx < (resources[0].detailedContent?.sections.length ?? 0) - 1 ? "1px solid var(--border)" : "none" }}>
                    <h4 className="text-xl font-bold text-primary mb-3">{section.title}</h4>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-xl" style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                <h4 className="text-xl font-bold text-foreground mb-3">Conclusion</h4>
                <p className="text-foreground/80 leading-relaxed">{resources[0].detailedContent?.conclusion}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

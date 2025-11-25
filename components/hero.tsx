"use client"

import { useEffect, useState } from "react"

interface HeroProps {
  setActiveTab: (tab: string) => void
  isLoggedIn: boolean
}

export default function Hero({ setActiveTab, isLoggedIn }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 left-1/3 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 xl:py-40">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div
            className={`space-y-8 transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-secondary rounded-full text-xs font-semibold text-foreground/80 uppercase tracking-wider animate-scaleIn">
                Trading Elite
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-tight animate-fadeInUp">
                Elite Trading
                <span className="block text-primary">Collective</span>
              </h1>
              <p
                className="text-base sm:text-lg lg:text-xl text-foreground/60 font-medium max-w-lg animate-fadeInUp"
                style={{ animationDelay: "0.2s" }}
              >
                Where strategy meets precision
              </p>
            </div>

            <p
              className="text-sm sm:text-base lg:text-lg text-foreground/70 leading-relaxed max-w-xl animate-fadeInUp"
              style={{ animationDelay: "0.3s" }}
            >
              Underdogs is a professional trading group dedicated to delivering superior market insights and strategic
              analysis. We combine rigorous methodology with institutional-grade discipline.
            </p>

            <div className="space-y-4 pt-4 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Our Mission</h3>
                <p className="text-foreground/70 leading-relaxed">
                  To empower traders with data-driven intelligence, fostering a culture of excellence and continuous
                  improvement.
                </p>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="pt-6 sm:pt-8 flex gap-4 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
                <button 
                  onClick={() => setActiveTab("register")}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover-lift shadow-md text-sm sm:text-base"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>

          {/* Logo Display */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Animated border ring */}
              <div
                className="absolute inset-0 border-2 border-primary/20 rounded-2xl animate-spin"
                style={{ animationDuration: "20s" }}
              />
              <div className="absolute inset-2 border border-primary/10 rounded-2xl" />

              {/* Glowing center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 sm:w-64 sm:h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="space-y-4 sm:space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 border-2 border-primary rounded-full flex items-center justify-center">
                        <div className="text-2xl sm:text-4xl font-black text-primary">U</div>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">Underdogs</p>
                      <p className="text-xs text-foreground/50">Trading Collective</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

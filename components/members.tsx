"use client"

import { useEffect, useState } from "react"

export default function Members() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const founders = [
    { id: 1, name: "Bones", role: "Founder/Head", involio: "https://involio.com/bones" },
    { id: 2, name: "CRYPTONOMY", role: "Founder/Head", involio: "https://involio.com/cryptonomy" },
    { id: 3, name: "Kowse", role: "Founder/Head", involio: "https://involio.com/kws" },
    { id: 4, name: "Mujahid", role: "Founder/Head", involio: "https://involio.com/markhor" },
    { id: 5, name: "Rehan", role: "Founder/Head", involio: "https://involio.com/rehan" },
    { id: 6, name: "James Hunter", role: "Founder/Head", involio: "https://involio.com/jhunter" },
    { id: 7, name: "Kregar", role: "Founder/Head", involio: "https://involio.com/kregar" },
  ]

  const members = [
    { id: 8, name: "Insider", role: "Member", involio: "https://involio.com/insider" },
    { id: 9, name: "ReflexX", role: "Member", involio: "https://involio.com/reflex" },
    { id: 10, name: "The Accountant", role: "Member", involio: "https://involio.com/the_accountant" },
    { id: 11, name: "Fortyseven", role: "Member", involio: "https://involio.com/fortyseven" },
    { id: 12, name: "0x744", role: "Member", involio: "https://involio.com/0x744" },
    { id: 13, name: "akqxz", role: "Member", involio: "https://involio.com/akqxz" },
    { id: 14, name: "Aquilae", role: "Member", involio: "https://involio.com/aquilae" },
    { id: 15, name: "AvarixTrading", role: "Member", involio: "https://involio.com/avarix" },
    { id: 16, name: "Booobsas", role: "Member", involio: "https://involio.com/booobsas" },
    { id: 17, name: "Azalion", role: "Member", involio: "https://involio.com/azalion" },
    { id: 18, name: "Darpan", role: "Member", involio: "https://involio.com/darpanet" },
    { id: 19, name: "Enigma", role: "Member", involio: "https://involio.com/enigma" },
    { id: 20, name: "Vortex_Legion", role: "Member", involio: "https://involio.com/vortex_legion" },
    { id: 21, name: "Johnnyonmeme", role: "Member", involio: "https://involio.com/johnnyonmeme" },
    { id: 22, name: "Pipsthetrader", role: "Member", involio: "https://involio.com/pipsthetrader" },
    { id: 23, name: "Prateek", role: "Member", involio: "https://involio.com/prateek" },
    { id: 24, name: "Starlight", role: "Member", involio: "https://involio.com/starlight23" },
    { id: 25, name: "Sunday", role: "Member", involio: "https://involio.com/sunday" },
  ]

  return (
    <section className="relative bg-background py-24 sm:py-32 lg:py-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-20">
          <div className="mb-12 space-y-4 animate-fadeInUp">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Founders & Heads</h2>
            <p className="text-lg text-foreground/60 max-w-2xl">The visionary leaders behind Underdogs</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((member, index) => (
              <div
                key={member.id}
                className="group relative animate-fadeInUp hover-lift"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div
                  className="relative rounded-xl p-8 transition-all duration-300"
                  style={{ border: "2px solid var(--primary)", backgroundColor: "var(--card)" }}
                >
                  <h3 className="mb-2 text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm font-semibold text-primary">{member.role}</p>

                  <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    {member.involio ? (
                      <a
                        href={member.involio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        View Involio Profile →
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-foreground/40">
                        View Involio Profile →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-12 space-y-4 animate-fadeInUp">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Team Members</h2>
            <p className="text-lg text-foreground/60 max-w-2xl">Talented traders and analysts united by excellence</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="group relative animate-fadeInUp hover-lift"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div
                  className="relative rounded-xl p-8 transition-all duration-300"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                >
                  <h3 className="mb-2 text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-foreground/60">{member.role}</p>

                  <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    {member.involio ? (
                      <a
                        href={member.involio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        View Involio Profile →
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-foreground/40">
                        View Involio Profile →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

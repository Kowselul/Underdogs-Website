export default function Footer() {
  return (
    <footer
      className="bg-background py-12 sm:py-16 mt-24 animate-fadeIn"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-8 md:grid-cols-4 mb-12">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">About</h3>
            <p className="text-sm text-foreground/60">
              Professional trading collective focused on strategic excellence
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Navigation</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Members
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Education
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Resources</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Market Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Research
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Legal</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-sm text-foreground/50">© 2025 Underdogs Trading Collective. All rights reserved.</p>
          <p className="text-sm text-foreground/50">Built for professional traders</p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Footer Component
 * Includes disclaimer and legal protection for risk management tool
 * Credit Suisse design system - Professional banking aesthetic
 */

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`mt-16 border-t border-border bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Disclaimer Section */}
        <div className="mb-6 p-6 bg-warning-bg border border-warning-border rounded-[10px]">
          <h3 className="text-sm font-semibold text-warning mb-2">
            Important Disclaimer
          </h3>
          <p className="text-xs text-warning leading-relaxed">
            <strong>Not Financial Advice:</strong> This calculator is provided for educational and informational purposes only.
            It is not intended to be, and should not be construed as, financial, investment, or trading advice.
            Trading and investing involve substantial risk of loss and are not suitable for every investor.
            Past performance does not guarantee future results.
          </p>
        </div>

        {/* Risk Disclosure */}
        <div className="mb-6 p-6 bg-error-bg border border-error-border rounded-[10px]">
          <h3 className="text-sm font-semibold text-error mb-2">
            Risk Disclosure
          </h3>
          <p className="text-xs text-error leading-relaxed mb-2">
            <strong>High Risk Warning:</strong> Trading stocks, options, futures, forex, and other financial instruments
            carries a high level of risk and may not be suitable for all investors. The high degree of leverage
            can work against you as well as for you. Before deciding to trade, you should carefully consider your
            investment objectives, level of experience, and risk appetite.
          </p>
          <p className="text-xs text-error leading-relaxed">
            There is a possibility that you could sustain a loss of some or all of your initial investment.
            Therefore, you should not invest money that you cannot afford to lose. You should be aware of all
            the risks associated with trading and seek advice from an independent financial advisor if you have any doubts.
          </p>
        </div>

        {/* Tool Purpose */}
        <div className="mb-6">
          <p className="text-xs text-ink-muted leading-relaxed">
            This position sizing calculator is a <strong>tool for risk management</strong>, not a trading system.
            It helps you calculate appropriate position sizes based on your account size, risk tolerance, and
            market volatility. Always perform your own due diligence and consult with qualified financial
            professionals before making any trading or investment decisions.
          </p>
        </div>

        {/* Footer Links and Copyright */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-xs text-ink-muted">
            © {currentYear} Risk Sizing Calculator. All rights reserved.
          </div>

          <div className="flex space-x-6 text-xs text-ink-muted">
            <span>
              Use at your own risk
            </span>
            <span className="hidden md:inline">•</span>
            <span>
              No warranties or guarantees
            </span>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-ink-muted opacity-75">
            Version 2.0 - Built with Next.js, TypeScript, and Zustand
          </p>
        </div>
      </div>
    </footer>
  );
}

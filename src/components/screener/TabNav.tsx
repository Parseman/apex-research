interface TabNavProps {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
  theme: 'equity' | 'crypto';
}

export default function TabNav({ tabs, active, onChange, theme }: TabNavProps) {
  const isEquity = theme === 'equity';
  const accentColor = isEquity ? '#C9A84C' : '#2DD4BF';
  const bgColor = isEquity ? '#EDE7D9' : '#D8EDF4';
  const borderColor = isEquity ? '#D4C9A8' : '#B0D4E0';
  const inkColor = isEquity ? '#1A1A1A' : '#0D1520';
  const mutedColor = isEquity ? '#5a5040' : '#2A6070';

  return (
    <div
      className="sticky top-12 z-40 border-b"
      style={{ background: bgColor, borderColor }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-0">
          {tabs.map((tab, i) => {
            const isActive = i === active;
            return (
              <button
                key={tab}
                onClick={() => onChange(i)}
                className="relative px-5 py-3 text-sm font-plex-sans font-medium transition-colors"
                style={{
                  color: isActive ? accentColor : mutedColor,
                  borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                  background: isActive ? `${accentColor}10` : 'transparent',
                }}
              >
                {tab}
                {i === 0 && (
                  <span
                    className="ml-2 text-xs font-plex-mono px-1 rounded"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
                    {isEquity ? '10' : '10'}
                  </span>
                )}
                <span className="sr-only">{isActive ? '(actif)' : ''}</span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center pr-1">
            <span className="text-xs font-plex-mono" style={{ color: mutedColor }}>
              {isEquity ? 'Equity' : 'Crypto'} Screener
            </span>
          </div>
          <span style={{ color: inkColor }} className="hidden">{inkColor}</span>
        </div>
      </div>
    </div>
  );
}

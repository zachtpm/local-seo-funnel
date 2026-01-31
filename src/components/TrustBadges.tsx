'use client';

const badges = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    label: 'Secure & Private',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    label: '5-Star Rated',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'No Obligation',
  },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-5 sm:gap-8 mt-10 pt-6 border-t border-muted/50">
      {badges.map((badge) => (
        <div key={badge.label} className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
          <span className="text-primary/80 p-1.5 bg-primary/5 rounded-full">{badge.icon}</span>
          <span className="font-medium">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

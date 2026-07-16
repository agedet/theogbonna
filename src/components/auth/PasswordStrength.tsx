export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-amber-400', 'bg-emerald-400'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i < score ? colors[score - 1] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <p
            key={c.label}
            className={`flex items-center gap-1 text-xs transition-colors ${c.ok ? 'text-emerald-400' : 'text-slate-600'}`}
          >
            <span>{c.ok ? '✓' : '○'}</span> {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

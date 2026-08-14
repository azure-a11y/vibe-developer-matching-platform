import { loginAction } from '@/lib/auth-actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6"
      style={{ background: 'var(--color-sidebar-bg)' }}
    >
      <form action={loginAction} className="card w-full max-w-sm space-y-6 shadow-xl shadow-black/20">
        <div>
          <p className="text-xs font-semibold tracking-tight" style={{ color: 'var(--color-ink-faint)' }}>
            Orca <span style={{ color: 'var(--color-accent)' }}>Admin</span>
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">로그인</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            관리자 계정으로 로그인하세요.
          </p>
        </div>

        {error && (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
          >
            이메일 또는 비밀번호가 올바르지 않습니다.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" className="field" required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="password">비밀번호</label>
            <input id="password" name="password" type="password" className="field" required />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          로그인
        </button>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-faint)' }}>
          계정이 없다면 관리자에게 발급을 요청하세요 — 최초 1개 계정은 서버 환경변수(
          <code className="font-mono">ADMIN_BOOTSTRAP_EMAIL</code> /{' '}
          <code className="font-mono">ADMIN_BOOTSTRAP_PASSWORD</code>)로 부트스트랩됩니다.
        </p>
      </form>
    </div>
  );
}

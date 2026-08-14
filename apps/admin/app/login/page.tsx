import { loginAction } from '@/lib/auth-actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-6">
      <form action={loginAction} className="card w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Orca <span className="text-neutral-400">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">관리자 계정으로 로그인하세요.</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            이메일 또는 비밀번호가 올바르지 않습니다.
          </p>
        )}

        <div>
          <label className="label" htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" className="field" required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="password">비밀번호</label>
          <input id="password" name="password" type="password" className="field" required />
        </div>

        <button type="submit" className="btn-primary w-full">
          로그인
        </button>

        <p className="text-xs text-neutral-400">
          계정이 없다면 관리자에게 발급을 요청하세요 — 최초 1개 계정은 서버 환경변수(
          <code className="font-mono">ADMIN_BOOTSTRAP_EMAIL</code> /{' '}
          <code className="font-mono">ADMIN_BOOTSTRAP_PASSWORD</code>)로 부트스트랩됩니다.
        </p>
      </form>
    </div>
  );
}

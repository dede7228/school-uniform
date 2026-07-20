import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl"
      >
        <h1 className="mb-1 text-xl font-semibold text-white">校服创意库</h1>
        <p className="mb-6 text-sm text-neutral-400">输入团队访问口令</p>
        <input type="hidden" name="next" value={params.next ?? "/"} />
        <input
          type="password"
          name="password"
          placeholder="访问口令"
          autoFocus
          className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-indigo-500"
        />
        {params.error && (
          <p className="mb-3 text-sm text-red-400">口令不正确，请重试</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-500"
        >
          进入
        </button>
      </form>
    </div>
  );
}

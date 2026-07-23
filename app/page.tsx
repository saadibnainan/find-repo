import Explorer from "@/components/Explorer";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-8">
      <header className="border-4 border-bone bg-concrete p-6 sm:p-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.4em] text-acid">
          {"/// public repository index"}
        </p>
        <h1 className="font-display text-4xl uppercase leading-none sm:text-7xl">
          Find<span className="text-acid">-</span>Repo
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm text-bone/70">
          Enter a GitHub username. Get their profile and public repositories.
          Click any repo to inspect its file tree.
        </p>
      </header>

      <Explorer />

      <footer className="mt-auto border-t-4 border-bone/20 pt-4 font-mono text-xs uppercase tracking-widest text-bone/40">
        Data: GitHub REST API // proxied server-side // token never leaves the
        server
      </footer>
    </main>
  );
}

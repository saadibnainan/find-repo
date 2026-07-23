import Explorer from "@/components/Explorer";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-8">
      <header className="border-4 border-bone bg-concrete p-6 sm:p-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-acid">
          {"/// public repository index"}
        </p>
        <h1>
          <Logo
            size={64}
            wordmarkClassName="text-4xl sm:text-7xl"
            className="gap-4 sm:gap-6"
          />
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

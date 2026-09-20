export default async function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple, secure sign-in with passkeys.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Replace this page with your application experience. Authentication
              is already wired up with passkeys.
            </p>
      </section>
    </div>
  );
}

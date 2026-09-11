import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f8f9fb] px-6 py-12">
      <SignIn />
    </main>
  );
}
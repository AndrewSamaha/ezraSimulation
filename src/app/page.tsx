import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-1 items-center justify-center w-full">
        <div className="flex justify-center w-full pb-10">
          <Image
            className="dark:invert"
            src="/lionFace.png"
            alt="Next.js logo"
            width={600}
            height={600}
            priority
          />
        </div>


        <div className="flex justify-center w-full">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-8 sm:px-10 mx-auto"
            href="/simulation"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Enter Simulation
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex  flex-wrap items-center justify-center">
        by Ezra and Andrew Samaha
      </footer>
    </div>
  );
}

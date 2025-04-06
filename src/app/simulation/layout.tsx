import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ezra's Simulation",
  description: "A simulation of evolution in a virtual world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <div className="absolute p-4 top-0 left-0">
        <Link
          href="/"
        >
          <Image
            className="dark:invert"
            src="/lionFace.whiteonblack.small.png"
            alt="Next.js logo"
            width={100}
            height={100}
            priority
          />
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { MetaViewContent } from "@/features/meta";
import { SiteConfig } from "@/site-config";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0d0d16] p-8 text-center">
      <MetaViewContent pageName="landing" />

      {/* Logo */}
      <div className="absolute left-6 top-6 flex items-center gap-2 text-base font-medium text-white opacity-90">
        <Image
          src="/images/quiz/ChatGPT Image 23 oct. 2025, 11_10_54_1761938952913.png"
          alt="BreakFree Logo"
          width={26}
          height={26}
          className="rounded-full"
          priority
        />
        <span>{SiteConfig.title}</span>
      </div>

      {/* Main content */}
      <div className="flex max-w-[600px] flex-col items-center gap-5">
        {/* Hero image */}
        <Image
          src="/images/quiz/pexels-andre-furtado-43594-1263986_1761942239297.jpg"
          alt="Hands breaking free"
          width={160}
          height={160}
          className="mb-4 h-40 w-40 rounded-full object-cover"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.05))" }}
          priority
        />

        {/* Headline */}
        <h1 className="w-full text-[1.9rem] font-semibold leading-[1.3] text-white">
          Break free from childhood trauma
        </h1>

        {/* Subheadline */}
        <p className="max-w-[420px] text-base font-normal italic leading-[1.6] text-white/80">
          Uncover your trauma score and learn how to move forward with confidence
        </p>

        {/* Social proof */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>⭐ 4.9/5 from 2,400+ reviews</span>
          <span>·</span>
          <span>127K+ people helped</span>
        </div>

        {/* CTA */}
        <Link
          href="/intro"
          className="mt-4 w-full rounded-full px-[42px] py-[14px] text-[1.05rem] font-semibold text-white transition-all duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:scale-[1.03]"
          style={{
            background: "#54d3bb",
            boxShadow: "0 4px 16px rgba(84, 211, 187, 0.3)",
          }}
        >
          Take the quiz →
        </Link>

        <p className="text-xs text-white/40">3-minute self-discovery quiz · 100% confidential</p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-sm text-gray-500">
        <p className="mb-2">2025 © {SiteConfig.company.name}. All Rights Reserved.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <span>|</span>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </footer>
    </div>
  );
}

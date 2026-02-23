import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ZipperVisual } from "@/components/zipper-visual"
import { UploadArea } from "@/components/upload-area"
import { StickyFooter } from "@/components/sticky-footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto">
      <Header />
      <main className="flex-1 pb-36">
        <HeroSection />
        <ZipperVisual />
        <UploadArea />
      </main>
      <StickyFooter />
    </div>
  )
}

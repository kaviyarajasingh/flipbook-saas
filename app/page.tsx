import FlipBook from "@/components/FlipBook"

export default function Home() {
  return (
    <main className="flex flex-col items-center h-screen pt-4">
      <h1 className="text-3xl font-bold mb-4">
        Flipbook SaaS Reader
      </h1>

      <div className="flex-1 w-full flex justify-center">
        <FlipBook />
      </div>
    </main>
  )
}
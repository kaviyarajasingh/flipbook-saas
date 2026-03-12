"use client"

import { useEffect, useRef } from "react"

export default function FlipbookViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadPDF = async () => {
      const pdfjsLib = await import("pdfjs-dist/build/pdf")
      const worker = await import("pdfjs-dist/build/pdf.worker.min.js")

      pdfjsLib.GlobalWorkerOptions.workerSrc = worker

      const pdf = await pdfjsLib.getDocument("/sampleStory.pdf").promise
      const page = await pdf.getPage(1)

      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")

      if (!canvas || !context) return

      // get original viewport
      const viewport = page.getViewport({ scale: 1 })

      // calculate scale based on window width
      const containerWidth = window.innerWidth * 0.8
      const scale = containerWidth / viewport.width

      const scaledViewport = page.getViewport({ scale })

      canvas.height = scaledViewport.height
      canvas.width = scaledViewport.width

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise
    }

    loadPDF()
  }, [])

  return (
    <div className="flex justify-center w-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
"use client"

import { useEffect, useRef, useState } from "react"
import { PageFlip } from "page-flip"

export default function FlipBook() {

  const bookRef = useRef<HTMLDivElement | null>(null)
  const flipRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [page,setPage] = useState(1)
  const [total,setTotal] = useState(0)
  const [zoom,setZoom] = useState(1)

  const [dark,setDark] = useState(false)
  const [fullscreen,setFullscreen] = useState(false)

  const [showThumbs,setShowThumbs] = useState(false)
  const [thumbs,setThumbs] = useState<string[]>([])

  const baseWidth = 600
  const baseHeight = 800
  const margin = 20

  const thumbnailWidth = showThumbs ? 200 : 0
  const extraRightSpace = showThumbs ? 20 : 0

  const rectangleWidth =
    baseWidth*zoom + margin*2 + thumbnailWidth + extraRightSpace

  /* BUTTON STYLE FOR LIGHT/DARK MODE */

  const buttonStyle = dark
    ? "px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
    : "px-2 py-1 bg-gray-200 text-black rounded hover:bg-gray-300"

  const zoomIn = () => {

    const maxZoom = window.innerWidth / (baseWidth + margin*2)

    setZoom(prev=>{
      const next = prev + 0.1
      return next>maxZoom ? prev : next
    })

  }

  const zoomOut = () => {

    setZoom(prev=>{
      const next = prev - 0.1
      return next<1 ? 1 : next
    })

  }

  const toggleTheme = ()=> setDark(!dark)

  const toggleFullscreen = async()=>{

    if(!document.fullscreenElement){

      await containerRef.current?.requestFullscreen()
      setFullscreen(true)

    }else{

      await document.exitFullscreen()
      setFullscreen(false)

    }

  }

  const jumpToPage = (p:number)=>{

    flipRef.current?.flip(p-1)

  }

  useEffect(()=>{

    const loadPDF = async()=>{

      const pdfjsLib = await import("pdfjs-dist")

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString()

      const pdf = await pdfjsLib.getDocument("/sampleStory.pdf").promise

      setTotal(pdf.numPages)

      const pages:HTMLDivElement[] = []
      const thumbsArr:string[] = []

      for(let i=1;i<=pdf.numPages;i++){

        const page = await pdf.getPage(i)

        const viewport = page.getViewport({scale:1.5})

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")!

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext:context,
          viewport
        }).promise

        const div = document.createElement("div")
        div.className="bg-white flex justify-center items-center"

        div.appendChild(canvas)
        pages.push(div)

        /* Thumbnail */

        const thumbCanvas = document.createElement("canvas")
        const thumbCtx = thumbCanvas.getContext("2d")!

        const thumbViewport = page.getViewport({scale:0.3})

        thumbCanvas.width = thumbViewport.width
        thumbCanvas.height = thumbViewport.height

        await page.render({
          canvasContext:thumbCtx,
          viewport:thumbViewport
        }).promise

        thumbsArr.push(thumbCanvas.toDataURL())

      }

      setThumbs(thumbsArr)

      const flipbook = new PageFlip(bookRef.current!,{
        width:baseWidth,
        height:baseHeight,
        showCover:true,
        mobileScrollSupport:false,
        useMouseEvents:false
      })

      flipbook.loadFromHTML(pages)

      flipbook.on("flip",(e:any)=>{
        setPage(e.data+1)
      })

      flipRef.current = flipbook

    }

    loadPDF()

  },[])

  const nextPage = ()=>flipRef.current?.flipNext()
  const prevPage = ()=>flipRef.current?.flipPrev()

  return(

  <div
  ref={containerRef}
  className={`min-h-screen flex justify-center items-center ${
    dark ? "bg-black text-white":"bg-gray-100 text-black"
  }`}
  >

    <div
    className="shadow-2xl rounded-xl flex flex-col items-center transition-all duration-300"
    style={{
      width:rectangleWidth,
      padding:margin
    }}
    >

      {/* HEADER */}

      <div className="flex justify-between items-center w-full mb-3">

        <div className="text-lg font-semibold">
          Flipbook Reader
        </div>

        <div className="flex gap-4 items-center">

          <button onClick={prevPage} className={buttonStyle}>←</button>

          <span>{page} / {total}</span>

          <button onClick={nextPage} className={buttonStyle}>→</button>

        </div>

        {/* CONTROLS */}

        <div className="flex gap-2">

          <button
          onClick={()=>setShowThumbs(!showThumbs)}
          className={buttonStyle}
          >
          ▦
          </button>

          <button
          onClick={zoomOut}
          className={buttonStyle}
          >
          -
          </button>

          <button
          onClick={zoomIn}
          className={buttonStyle}
          >
          +
          </button>

          <button
          onClick={toggleTheme}
          className={buttonStyle}
          >
          {dark ? "☀️":"🌙"}
          </button>

          <button
          onClick={toggleFullscreen}
          className={buttonStyle}
          >
          {fullscreen ? "⤫":"⛶"}
          </button>

        </div>

      </div>

      {/* BODY */}

      <div className="flex">

        {/* FLIPBOOK */}

        <div className="flex justify-center overflow-hidden">

          <div
          style={{
            width:baseWidth*zoom,
            height:baseHeight*zoom
          }}
          >

            <div
            ref={bookRef}
            style={{
              transform:`scale(${zoom})`,
              transformOrigin:"top left"
            }}
            />

          </div>

        </div>

        {/* THUMBNAIL SIDEBAR */}

        {showThumbs && (

          <div className="ml-4 w-[180px] h-[800px] overflow-y-auto border rounded p-2 bg-white">

            {thumbs.map((img,i)=>(

              <div
              key={i}
              onClick={()=>jumpToPage(i+1)}
              className={`mb-3 cursor-pointer border ${
                page===i+1
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              >

                <img src={img} />

                <div className="text-center text-xs">
                  Page {i+1}
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  </div>

  )

}
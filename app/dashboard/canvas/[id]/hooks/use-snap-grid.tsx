"use client"

import { useEffect, useRef, useState } from "react"

interface SnapGridProps {
  fabricCanvasRef: React.MutableRefObject<any>
  gridSize?: number
  enabled?: boolean
}

export function useSnapGrid({ 
  fabricCanvasRef, 
  gridSize = 5, 
  enabled = true 
}: SnapGridProps) {
  const [isGridVisible, setIsGridVisible] = useState(false)
  const [isSnapEnabled] = useState(true) // Always enabled
  const [isObjectSnapEnabled, setIsObjectSnapEnabled] = useState(true)
  const [currentGridSize, setCurrentGridSize] = useState(gridSize)
  const [snapDistance, setSnapDistance] = useState(10)
  const gridPatternRef = useRef<SVGPatternElement | null>(null)

  const snapToGrid = (value: number) => {
    return Math.round(value / currentGridSize) * currentGridSize
  }

  const snapToObjects = (movingObj: any, x: number, y: number) => {
    if (!isObjectSnapEnabled || !fabricCanvasRef.current) return { x, y, guides: [] }

    const canvas = fabricCanvasRef.current
    const objects = canvas.getObjects()
    let snappedX = x
    let snappedY = y
    const guides: any[] = []

    for (const obj of objects) {
      if (obj === movingObj) continue

      const objBounds = obj.getBoundingRect()
      const movingBounds = movingObj.getBoundingRect()

      // Snap to object edges (left, right, center)
      const objLeft = objBounds.left
      const objRight = objBounds.left + objBounds.width
      const objCenterX = objBounds.left + objBounds.width / 2

      const movingLeft = x
      const movingRight = x + movingBounds.width
      const movingCenterX = x + movingBounds.width / 2

      // Horizontal snapping with guides
      if (Math.abs(movingLeft - objLeft) < snapDistance) {
        snappedX = objLeft
        guides.push({ type: 'vertical', x: objLeft })
      } else if (Math.abs(movingLeft - objRight) < snapDistance) {
        snappedX = objRight
        guides.push({ type: 'vertical', x: objRight })
      } else if (Math.abs(movingLeft - objCenterX) < snapDistance) {
        snappedX = objCenterX
        guides.push({ type: 'vertical', x: objCenterX })
      } else if (Math.abs(movingRight - objLeft) < snapDistance) {
        snappedX = objLeft - movingBounds.width
        guides.push({ type: 'vertical', x: objLeft })
      } else if (Math.abs(movingRight - objRight) < snapDistance) {
        snappedX = objRight - movingBounds.width
        guides.push({ type: 'vertical', x: objRight })
      } else if (Math.abs(movingRight - objCenterX) < snapDistance) {
        snappedX = objCenterX - movingBounds.width
        guides.push({ type: 'vertical', x: objCenterX })
      } else if (Math.abs(movingCenterX - objLeft) < snapDistance) {
        snappedX = objLeft - movingBounds.width / 2
        guides.push({ type: 'vertical', x: objLeft })
      } else if (Math.abs(movingCenterX - objRight) < snapDistance) {
        snappedX = objRight - movingBounds.width / 2
        guides.push({ type: 'vertical', x: objRight })
      } else if (Math.abs(movingCenterX - objCenterX) < snapDistance) {
        snappedX = objCenterX - movingBounds.width / 2
        guides.push({ type: 'vertical', x: objCenterX })
      }

      // Snap to object edges (top, bottom, center)
      const objTop = objBounds.top
      const objBottom = objBounds.top + objBounds.height
      const objCenterY = objBounds.top + objBounds.height / 2

      const movingTop = y
      const movingBottom = y + movingBounds.height
      const movingCenterY = y + movingBounds.height / 2

      // Vertical snapping with guides
      if (Math.abs(movingTop - objTop) < snapDistance) {
        snappedY = objTop
        guides.push({ type: 'horizontal', y: objTop })
      } else if (Math.abs(movingTop - objBottom) < snapDistance) {
        snappedY = objBottom
        guides.push({ type: 'horizontal', y: objBottom })
      } else if (Math.abs(movingTop - objCenterY) < snapDistance) {
        snappedY = objCenterY
        guides.push({ type: 'horizontal', y: objCenterY })
      } else if (Math.abs(movingBottom - objTop) < snapDistance) {
        snappedY = objTop - movingBounds.height
        guides.push({ type: 'horizontal', y: objTop })
      } else if (Math.abs(movingBottom - objBottom) < snapDistance) {
        snappedY = objBottom - movingBounds.height
        guides.push({ type: 'horizontal', y: objBottom })
      } else if (Math.abs(movingBottom - objCenterY) < snapDistance) {
        snappedY = objCenterY - movingBounds.height
        guides.push({ type: 'horizontal', y: objCenterY })
      } else if (Math.abs(movingCenterY - objTop) < snapDistance) {
        snappedY = objTop - movingBounds.height / 2
        guides.push({ type: 'horizontal', y: objTop })
      } else if (Math.abs(movingCenterY - objBottom) < snapDistance) {
        snappedY = objBottom - movingBounds.height / 2
        guides.push({ type: 'horizontal', y: objBottom })
      } else if (Math.abs(movingCenterY - objCenterY) < snapDistance) {
        snappedY = objCenterY - movingBounds.height / 2
        guides.push({ type: 'horizontal', y: objCenterY })
      }
    }

    return { x: snappedX, y: snappedY, guides }
  }

  const drawGrid = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const canvasElement = canvas.getElement()

    // Remove existing grid and guides
    const existingGrid = canvasElement.parentElement?.querySelector('.canvas-grid')
    if (existingGrid) {
      existingGrid.remove()
    }

    if (!isGridVisible) return

    // Create SVG grid overlay
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.classList.add('canvas-grid')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.width = `${canvas.width}px`
    svg.style.height = `${canvas.height}px`
    svg.style.pointerEvents = 'none'
    svg.style.zIndex = '1'

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern")
    pattern.id = 'grid-pattern'
    pattern.setAttribute('width', currentGridSize.toString())
    pattern.setAttribute('height', currentGridSize.toString())
    pattern.setAttribute('patternUnits', 'userSpaceOnUse')

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute('d', `M ${currentGridSize} 0 L 0 0 0 ${currentGridSize}`)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#e0e0e0')
    path.setAttribute('stroke-width', '1')
    path.setAttribute('opacity', '0.5')

    pattern.appendChild(path)
    defs.appendChild(pattern)
    svg.appendChild(defs)

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', 'url(#grid-pattern)')

    svg.appendChild(rect)
    canvasElement.parentElement?.appendChild(svg)
    gridPatternRef.current = pattern
  }

  const drawGuides = (guides: any[]) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const canvasElement = canvas.getElement()

    // Remove existing guides
    const existingGuides = canvasElement.parentElement?.querySelector('.alignment-guides')
    if (existingGuides) {
      existingGuides.remove()
    }

    if (guides.length === 0) return

    // Create SVG guides overlay
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.classList.add('alignment-guides')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.width = `${canvas.width}px`
    svg.style.height = `${canvas.height}px`
    svg.style.pointerEvents = 'none'
    svg.style.zIndex = '10'

    guides.forEach(guide => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      
      if (guide.type === 'vertical') {
        line.setAttribute('x1', guide.x.toString())
        line.setAttribute('y1', '0')
        line.setAttribute('x2', guide.x.toString())
        line.setAttribute('y2', canvas.height.toString())
      } else {
        line.setAttribute('x1', '0')
        line.setAttribute('y1', guide.y.toString())
        line.setAttribute('x2', canvas.width.toString())
        line.setAttribute('y2', guide.y.toString())
      }
      
      line.setAttribute('stroke', '#ff4081')
      line.setAttribute('stroke-width', '1')
      line.setAttribute('opacity', '0.8')
      line.setAttribute('stroke-dasharray', '5,5')
      
      svg.appendChild(line)
    })

    canvasElement.parentElement?.appendChild(svg)
  }

  const clearGuides = () => {
    if (!fabricCanvasRef.current) return
    
    const canvas = fabricCanvasRef.current
    const canvasElement = canvas.getElement()
    const existingGuides = canvasElement.parentElement?.querySelector('.alignment-guides')
    if (existingGuides) {
      existingGuides.remove()
    }
  }

  const setupSnapBehavior = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    // Handle object movement to show guides
    const handleObjectMoving = (e: any) => {
      const obj = e.target
      if (!obj) return

      let snappedLeft = obj.left
      let snappedTop = obj.top
      let guides: any[] = []

      // Apply object snapping first
      if (isObjectSnapEnabled) {
        const objSnap = snapToObjects(obj, obj.left, obj.top)
        snappedLeft = objSnap.x
        snappedTop = objSnap.y
        guides = objSnap.guides || []
      }

      // Apply grid snapping if enabled
      if (isSnapEnabled) {
        snappedLeft = snapToGrid(snappedLeft)
        snappedTop = snapToGrid(snappedTop)
      }

      // Update object position if snapped
      if (snappedLeft !== obj.left || snappedTop !== obj.top) {
        obj.set({
          left: snappedLeft,
          top: snappedTop
        })
        canvas.requestRenderAll()
      }

      // Draw alignment guides
      drawGuides(guides)
    }

    // Use object:modified for final cleanup
    const handleObjectModified = (e: any) => {
      clearGuides()
    }

    // Handle scaling - removed snap behavior to prevent buggy scaling
    const handleObjectScaling = (e: any) => {
      // Let scaling happen naturally without grid interference
      return
    }

    // Fix mouse coordinate snapping for drawing
    const handleMouseDown = (e: any) => {
      if (!isSnapEnabled || !e.e) return

      const pointer = canvas.getPointer(e.e)
      const snappedX = snapToGrid(pointer.x)
      const snappedY = snapToGrid(pointer.y)

      // Store original coordinates and override with snapped ones
      if (e.pointer) {
        e.pointer.x = snappedX
        e.pointer.y = snappedY
      }
    }

    // Add path:created event for drawing tools
    const handlePathCreated = (e: any) => {
      if (!isSnapEnabled || !e.path) return

      const path = e.path
      const snappedLeft = snapToGrid(path.left)
      const snappedTop = snapToGrid(path.top)

      path.set({
        left: snappedLeft,
        top: snappedTop
      })

      canvas.requestRenderAll()
    }

    // Bind events
    canvas.on('object:moving', handleObjectMoving)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('path:created', handlePathCreated)
    canvas.on('selection:cleared', clearGuides)

    return () => {
      canvas.off('object:moving', handleObjectMoving)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('path:created', handlePathCreated)
      canvas.off('selection:cleared', clearGuides)
    }
  }

  const toggleGrid = () => {
    setIsGridVisible(!isGridVisible)
  }

  

  const toggleObjectSnap = () => {
    setIsObjectSnapEnabled(!isObjectSnapEnabled)
  }

  const setGridSize = (size: number) => {
    setCurrentGridSize(Math.max(5, Math.min(100, size)))
  }

  // Setup grid drawing when visibility changes
  useEffect(() => {
    drawGrid()
  }, [isGridVisible, currentGridSize, fabricCanvasRef.current])

  // Setup snap behavior when canvas is ready
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const cleanup = setupSnapBehavior()
    return cleanup
  }, [fabricCanvasRef.current, isSnapEnabled, currentGridSize])

  // Redraw grid on canvas resize
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    const handleCanvasResize = () => {
      if (isGridVisible) {
        setTimeout(drawGrid, 100) // Delay to ensure canvas has resized
      }
    }

    const resizeObserver = new ResizeObserver(handleCanvasResize)
    const canvasElement = canvas.getElement()
    if (canvasElement) {
      resizeObserver.observe(canvasElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [fabricCanvasRef.current, isGridVisible, currentGridSize])

  return {
    isGridVisible,
    isSnapEnabled,
    isObjectSnapEnabled,
    currentGridSize,
    snapDistance,
    toggleGrid,
    toggleObjectSnap,
    setGridSize,
    setSnapDistance,
    snapToGrid
  }
}
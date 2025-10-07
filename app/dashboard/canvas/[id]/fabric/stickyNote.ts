
import { fabric } from "fabric"

export const StickyNote = fabric.util.createClass(fabric.Group, {
  type: "stickyNote",
  
  initialize(text = "Type your note here...", options: any = {}) {
    const stickyColors = [
      { name: "yellow", bg: "#FEF3C7" },
      { name: "pink", bg: "#FCE7F3" },
      { name: "blue", bg: "#DBEAFE" },
      { name: "green", bg: "#D1FAE5" },
      { name: "orange", bg: "#FED7AA" },
      { name: "purple", bg: "#E9D5FF" },
    ]

    const selectedColor = stickyColors.find(c => c.name === (options.stickyColor || "yellow")) || stickyColors[0]

    const rect = new fabric.Rect({
      width: options.width || 200,
      height: options.height || 200,
      fill: selectedColor.bg,
      stroke: selectedColor.bg,
      strokeWidth: 1,
      rx: 5,
      ry: 5,
      selectable: false,
      evented: false,
    })

    const textbox = new fabric.Textbox(text, {
      left: 15,
      top: 15,
      width: (options.width || 200) - 30,
      height: (options.height || 200) - 30,
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#374151",
      textAlign: "left",
      splitByGrapheme: true,
      editable: true,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      backgroundColor: "transparent",
      padding: 0,
    })

    const objects = [rect, textbox]
    
    this.callSuper("initialize", objects, {
      ...options,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerColor: "#2563eb",
      cornerSize: 8,
      transparentCorners: false,
    })

    this.rect = rect
    this.textbox = textbox
    this.stickyColor = options.stickyColor || "yellow"
    this.backgroundColor = selectedColor.bg
    this.isTextObject = true
  },

  toObject(propertiesToInclude: string[] = []) {
    return {
      ...this.callSuper("toObject", propertiesToInclude),
      text: this.textbox.text,
      stickyColor: this.stickyColor,
      backgroundColor: this.backgroundColor,
      isTextObject: this.isTextObject,
    }
  },

  getText() {
    return this.textbox.text
  },

  setText(text: string) {
    this.textbox.set("text", text)
    this.canvas?.renderAll()
  },

  setStickyColor(colorName: string) {
    const stickyColors = [
      { name: "yellow", bg: "#FEF3C7" },
      { name: "pink", bg: "#FCE7F3" },
      { name: "blue", bg: "#DBEAFE" },
      { name: "green", bg: "#D1FAE5" },
      { name: "orange", bg: "#FED7AA" },
      { name: "purple", bg: "#E9D5FF" },
    ]

    const color = stickyColors.find(c => c.name === colorName)
    if (!color) return

    this.rect.set("fill", color.bg)
    this.rect.set("stroke", color.bg)
    this.stickyColor = colorName
    this.backgroundColor = color.bg
    this.canvas?.renderAll()
  },

  setFontSize(size: number) {
    this.textbox.set("fontSize", size)
    this.canvas?.renderAll()
  },

  setTextAlign(alignment: string) {
    this.textbox.set("textAlign", alignment)
    this.canvas?.renderAll()
  }
})

// Register for Fabric JSON parsing
fabric.StickyNote = StickyNote
fabric.StickyNote.fromObject = (obj: any, callback: any) => {
  const note = new fabric.StickyNote(obj.text, {
    ...obj,
    left: obj.left,
    top: obj.top,
  })
  callback(note)
}

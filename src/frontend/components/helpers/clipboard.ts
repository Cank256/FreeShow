import { get } from "svelte/store"
import { uid } from "uid"
import { activeEdit, activeShow, clipboard, overlays, selected, showsCache, templates } from "../../stores"
import { clone } from "./array"
import { history } from "./history"
import { _show } from "./shows"

const copyData: any = {
  item: (data: any) => {
    let ref = _show(data.id || "active")
      .layouts("active")
      .ref()?.[0]?.[data.slide!]
    if (!ref) return null
    let items = _show(data.id || "active")
      .slides([ref.id])
      .items()
      .get(null, false)[0]
      .filter((_a: any, i: number) => data.items.includes(i))
    return [...items]
  },
  slide: (data: any) => {
    let ref = _show("active").layouts("active").ref()?.[0]
    let ids = data.map((a: any) => a.id || (a.index !== undefined ? ref[a.index].id : ""))
    // TODO: copy media too
    return _show("active").slides(ids).get(null)
  },
  group: (data: any) => copyData.slide(data),
  overlay: (data: any) => {
    return data.map((id: string) => get(overlays)[id])
  },
  template: (data: any) => {
    return data.map((id: string) => get(templates)[id])
  },
}

export function copy({ id, data }: any = {}, getData: boolean = true) {
  let copy: any = { id, data }
  if (get(selected).id) copy = get(selected)
  else if (get(activeEdit).items.length) copy = { id: "item", data: get(activeEdit) }
  else if (window.getSelection()) navigator.clipboard.writeText(window.getSelection()!.toString())

  if (!copy) return

  if (getData && copyData[copy.id]) copy.data = copyData[copy.id](copy.data)

  if (copy.data) clipboard.set(copy)

  console.log("COPIED:", copy.id)
  console.log("CLIPBOARD", get(clipboard))
}

const paster: any = {
  item: (data: any) => {
    let ref = _show(get(activeEdit).id || "active")
      .layouts("active")
      .ref()?.[0][get(activeEdit).slide!]
    data.forEach((item: any) => {
      history({ id: "newItem", newData: clone(item), location: { page: "edit", show: { id: get(activeEdit).id || get(activeShow)!.id }, slide: ref.id } })
    })
  },
  slide: (data: any) => {
    // clone slides
    data = clone(data)

    // get all slide ids & child ids
    let copiedIds: string[] = data.map((a: any) => a.id)
    // let childs: any[] = []
    // data.forEach((slide: any) => {
    //   copiedIds.push(slide.id)
    //   if (slide.children?.length) childs.push(...slide.children)
    // })

    let slides: any = _show().get().slides
    let ref: any[] = _show().layouts("active").ref()[0]
    let newSlides: any[] = []

    // remove children
    data.map((slide: any) => {
      // has children
      if (slide.children) {
        let children: string[] = []
        children = slide.children.filter((child: string) => copiedIds.includes(child))
        // if (JSON.stringify(children) !== JSON.stringify(slide.children)) slide.id = uid()
        if (children.length && slide.children.length > children.length) slide.children = children

        // clone children
        let clonedChildren: string[] = []
        slide.children.forEach((childId: string) => {
          let childSlide: any = clone(slides[childId])
          childSlide.id = uid()
          clonedChildren.push(childSlide.id)
          newSlides.push(childSlide)
        })

        slide.children = clonedChildren
      } else if (slide.group === null && !copiedIds.includes(slide.id)) {
        // is child
        let slideRef = ref.find((a) => a.id === slide.id)
        let parent: any = slides[slideRef.parent.id]
        slide.group = parent.group || ""
        slide.color = parent.color || ""
        slide.globalGroup = parent.globalGroup || ""
      }

      slide.id = uid()
      newSlides.push(slide)
    })
    // TODO: children next to each other should be grouped
    // TODO: add at index

    history({
      id: "newSlide",
      newData: { slides: newSlides },
      location: { page: "show", show: get(activeShow)!, layout: get(showsCache)[get(activeShow)!.id].settings.activeLayout },
    })
    setTimeout(() => console.log(get(showsCache)), 1000)
  },
  group: (data: any) => paster.slide(data),
  overlay: (data: any) => {
    data.forEach((slide: any) => {
      slide = JSON.parse(JSON.stringify(slide))
      slide.name += " 2"
      history({ id: "newOverlay", newData: { data: slide } })
    })
  },
  template: (data: any) => {
    data.forEach((slide: any) => {
      slide = JSON.parse(JSON.stringify(slide))
      slide.name += " 2"
      history({ id: "newTemplate", newData: { data: slide } })
    })
  },
}

export function paste() {
  let clip = get(clipboard)
  let activeElem: any = document.activeElement
  console.log(activeElem?.classList)
  if (clip.id === null || activeElem?.classList?.contains(".edit")) {
    navigator.clipboard.readText().then((clipText: string) => {
      // TODO: insert at caret pos
      // TODO: paste properly in textbox
      if (activeElem.nodeName === "INPUT" || activeElem.nodeName === "TEXTAREA") activeElem.value += clipText
      else activeElem.innerHTML += clipText
    })
    return
  }

  if (paster[clip.id]) {
    paster[clip.id](clip.data)
    console.log("PASTED:", clip)
  }
}

import { get } from "svelte/store"
import { STORE } from "../../types/Channels"
import {
  activeProject,
  audioFolders,
  defaultProjectName,
  displayMetadata,
  drawer,
  drawerTabsData,
  drawSettings,
  events,
  folders,
  fullColors,
  groupCount,
  groupNumbers,
  groups,
  imageExtensions,
  labelsDisabled,
  language,
  mediaFolders,
  mediaOptions,
  openedFolders,
  os,
  outLocked,
  overlayCategories,
  overlays,
  playerVideos,
  projects,
  resized,
  saved,
  screen,
  shows,
  showsCache,
  showsPath,
  slidesOptions,
  stageShows,
  templateCategories,
  templates,
  theme,
  themes,
  videoExtensions,
  webFavorites,
} from "./../stores"

export function save() {
  console.log("SAVING...")

  let settings: any = {
    initialized: true,
    activeProject: get(activeProject),
    audioFolders: get(audioFolders),
    defaultProjectName: get(defaultProjectName),
    displayMetadata: get(displayMetadata),
    drawer: get(drawer),
    drawerTabsData: get(drawerTabsData),
    drawSettings: get(drawSettings),
    groupNumbers: get(groupNumbers),
    fullColors: get(fullColors),
    groupCount: get(groupCount),
    groups: get(groups),
    imageExtensions: get(imageExtensions),
    labelsDisabled: get(labelsDisabled),
    language: get(language),
    mediaFolders: get(mediaFolders),
    mediaOptions: get(mediaOptions),
    openedFolders: get(openedFolders),
    os: get(os),
    outLocked: get(outLocked),
    overlayCategories: get(overlayCategories),
    playerVideos: get(playerVideos),
    resized: get(resized),
    screen: get(screen),
    slidesOptions: get(slidesOptions),
    templateCategories: get(templateCategories),
    theme: get(theme),
    videoExtensions: get(videoExtensions),
    webFavorites: get(webFavorites),
  }
  // save settings & shows
  // , shows: get(shows)

  window.api.send(STORE, {
    channel: "SAVE",
    data: {
      settings,
      shows: get(shows),
      showsCache: get(showsCache),
      stageShows: get(stageShows),
      projects: { projects: get(projects), folders: get(folders) },
      overlays: get(overlays),
      templates: get(templates),
      events: get(events),
      themes: get(themes),
      path: get(showsPath),
    },
  })

  saved.set(true)
}

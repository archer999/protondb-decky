import React from 'react'
import { definePlugin, staticClasses } from '@decky/ui'
import { routerHook } from '@decky/api'
import { FaReact } from 'react-icons/fa'

import Settings from './components/settings'
import patchLibraryApp from './lib/patchLibraryApp'
import { loadSettings } from './hooks/useSettings'

export default definePlugin(() => {
  let libraryPatch: ReturnType<typeof patchLibraryApp> | null = null

  try {
    loadSettings()
  } catch (e) {
    console.error('[ProtonDB] loadSettings', e)
  }

  try {
    libraryPatch = patchLibraryApp()
  } catch (e) {
    console.error('[ProtonDB] patchLibraryApp', e)
  }

  return {
    title: <div className={staticClasses.Title}>ProtonDB Badges</div>,
    icon: <FaReact />,
    content: <Settings />,
    onDismount() {
      try {
        if (libraryPatch) {
          routerHook.removePatch('/library/app/:appid', libraryPatch)
        }
      } catch {}
    }
  }
})

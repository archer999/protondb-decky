import { appDetailsClasses, appDetailsHeaderClasses, Navigation } from '@decky/ui'
import React, { ReactElement, FC, CSSProperties, ReactNode, useState, useRef, useEffect } from 'react'
import { FaReact } from 'react-icons/fa'
import { IoLogoTux } from 'react-icons/io'

import useAppId from '../../hooks/useAppId'
import useBadgeData from '../../hooks/useBadgeData'
import useTranslations from '../../hooks/useTranslations'

import { Button, ButtonProps } from '../button'

import style from './style'
import { useSettings } from '../../hooks/useSettings'

type ExtendedButtonProps = ButtonProps & {
  children: ReactNode
  type: 'button'
  style?: CSSProperties
  className: string
}

const DeckButton = Button as FC<ExtendedButtonProps>

const positonSettings = {
  tl: { top: '40px', left: '20px' },
  tr: { top: '60px', right: '20px' },
  bl: { bottom: '40px', left: '20px' },
  br: { bottom: '40px', right: '20px' }
}

function findTopCapsuleParent(ref: HTMLDivElement | null): Element | null {
  const root = ref?.parentElement
  if (!root) {
    return null
  }

  const walk = (node: Element | null): Element | null => {
    if (!node) {
      return null
    }

    const className = typeof node.className === 'string' ? node.className : ''
    const isHeaderLike =
      className.includes(appDetailsClasses.Header) ||
      className.includes('Header') ||
      className.includes('AppDetailsHeader') ||
      className.includes('LibraryAppDetails')

    if (isHeaderLike) {
      for (const child of Array.from(node.children)) {
        const childClassName = typeof child.className === 'string' ? child.className : ''
        const isCapsuleLike =
          childClassName.includes(appDetailsHeaderClasses.TopCapsule) ||
          childClassName.includes('TopCapsule') ||
          childClassName.includes('Capsule') ||
          childClassName.includes('HeaderImage')

        if (isCapsuleLike) {
          return child
        }
      }
    }

    for (const child of Array.from(node.children)) {
      const nested = walk(child)
      if (nested) {
        return nested
      }
    }

    return null
  }

  return walk(root)
}

export default function ProtonMedal(): ReactElement {
  const t = useTranslations()
  const appId = useAppId()
  const { protonDBTier, linuxSupport, refresh } = useBadgeData(appId)
  const { settings, loading } = useSettings()

  // There will be no mutation when the page is loaded (either from exiting the game
  // or just newly opening the page), therefore it's visible by default.
  const [show, setShow] = useState<boolean>(true)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const topCapsule = findTopCapsuleParent(ref?.current)
    if (!topCapsule) {
      console.error("TopCapsule container not found!")
      return
    }

    const mutationObserver = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (entry.type !== "attributes" || entry.attributeName !== "class") {
          continue
        }

        const className = (entry.target as Element).className
        const fullscreenMode =
          className.includes(appDetailsHeaderClasses.FullscreenEnterStart) ||
          className.includes(appDetailsHeaderClasses.FullscreenEnterActive) ||
          className.includes(appDetailsHeaderClasses.FullscreenEnterDone) ||
          className.includes(appDetailsHeaderClasses.FullscreenExitStart) ||
          className.includes(appDetailsHeaderClasses.FullscreenExitActive)
        const fullscreenAborted =
          className.includes(appDetailsHeaderClasses.FullscreenExitDone)

        setShow(!fullscreenMode || fullscreenAborted)
      }
    })
    mutationObserver.observe(topCapsule, { attributes: true, attributeFilter: ["class"] })
    return () => {
      mutationObserver.disconnect()
    }
  }, [])

  const tierClass = `protondb-decky-indicator-${protonDBTier}` as const
  const nativeClass = linuxSupport ? 'protondb-decky-indicator-native' : ''
  const sizeClass = `protondb-decky-indicator-${settings.size || 'regular'
    }` as const

  const labelTypeOnHoverClass =
    settings.size !== 'minimalist' || settings.labelTypeOnHover === 'off'
      ? ''
      : `protondb-decky-indicator-label-on-hover-${settings.labelTypeOnHover}`

  return (
    <div
      ref={ref}
      className="protondb-decky-indicator-container"
      style={{ position: 'absolute', ...positonSettings[settings.position] }}
    >
      {protonDBTier && show && !loading &&
        <>
          {style}
          <DeckButton
            className={`protondb-decky-indicator ${tierClass} ${nativeClass} ${sizeClass} ${labelTypeOnHoverClass}`}
            type="button"
            onClick={async () => {
              refresh()
              Navigation.NavigateToExternalWeb(
                `https://www.protondb.com/app/${appId}`
              )
            }}
          >
            <div>
              {linuxSupport ? (
                <IoLogoTux
                  style={{ marginRight: 10 }}
                />
              ) : (
                <></>
              )}
              {/* The ProtonDB logo has a distracting background, so React's logo is being used as a close substitute */}
              <FaReact />
            </div>
            <span>
              {settings.size === 'small' ||
                (settings.size === 'minimalist' &&
                  settings.labelTypeOnHover !== 'regular')
                ? t(`tierMin${protonDBTier}`)
                : t(`tier${protonDBTier}`)}
            </span>
          </DeckButton>
        </>
      }
    </div>
  )
}

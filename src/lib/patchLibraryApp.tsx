import {
  afterPatch,
  findInReactTree,
  appDetailsClasses,
  createReactTreePatcher
} from '@decky/ui'
import { routerHook } from '@decky/api'
import React, { ReactElement } from 'react'
import ProtonMedal from '../components/protonMedal'

function findAppDetailsContainer(node: unknown): any {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const candidate = findInReactTree(
    node,
    (x: any) => {
      if (!x || typeof x !== 'object' || !x.props) {
        return false
      }

      const className = typeof x.props.className === 'string' ? x.props.className : ''
      const hasInnerContainer = className.includes(appDetailsClasses.InnerContainer)
      const hasOverview = !!x.props.overview
      const children = x.props.children
      const hasOverviewChild = Array.isArray(children)
        ? children.some((child: any) => !!child?.props?.overview)
        : !!children?.props?.overview

      return hasInnerContainer || hasOverview || hasOverviewChild
    }
  )

  if (candidate && candidate.props) {
    return candidate
  }

  return findInReactTree(
    node,
    (x: any) => {
      if (!x || typeof x !== 'object' || !x.props) {
        return false
      }

      const className = typeof x.props.className === 'string' ? x.props.className : ''
      const children = x.props.children
      return (
        className.includes('AppDetails') ||
        className.includes('Details') ||
        className.includes('LibraryApp') ||
        (!!children && typeof children === 'object' && !!children.props?.overview)
      )
    }
  )
}

function patchLibraryApp() {
  return routerHook.addPatch(
    '/library/app/:appid',
    (tree: any) => {
      const routeProps = findInReactTree(tree, (x: any) => x?.renderFunc)
      if (routeProps) {
        const patchHandler = createReactTreePatcher(
          [
            (root: any) => findAppDetailsContainer(root)
          ],
          (_: Array<Record<string, unknown>>, ret?: ReactElement) => {
            const container = findAppDetailsContainer(ret)
            if (!container || !container.props) {
              return ret
            }

            const children = container.props.children
            if (Array.isArray(children)) {
              const alreadyInserted = children.some(
                (child: any) => child?.type === ProtonMedal || child?.props?.className?.includes('protondb-decky-indicator-container')
              )
              if (!alreadyInserted) {
                children.splice(1, 0, <ProtonMedal key="protondb-decky-badge" />)
              }
            } else if (children) {
              container.props.children = [
                children,
                <ProtonMedal key="protondb-decky-badge" />
              ]
            } else {
              container.props.children = <ProtonMedal key="protondb-decky-badge" />
            }

            return ret
          }
        )

        afterPatch(routeProps, 'renderFunc', patchHandler)
      }

      return tree
    }
  )
}

export default patchLibraryApp

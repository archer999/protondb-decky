import { fetchNoCors } from '@decky/api'
import { useEffect, useState } from 'react'
import { appTypes } from '../constants'
import { useParams } from './useParams'

function cleanString(str: string) {
  return str
    .replace(/['"\u0040\u0026\u2122\u00ae]/g, '')
    .toLowerCase()
    .trim()
}

function parseRouteAppId(): string | undefined {
  const params = (useParams as any)?.() ?? {}
  const candidates = [
    params?.appid,
    params?.appId,
    params?.gameid,
    params?.id,
    params?.app_id,
    params?.game_id
  ]

  const fromParams = candidates.find((value) => typeof value === 'string' && value.length > 0)
  if (fromParams) {
    return fromParams
  }

  const pathMatch = window.location.pathname.match(/(?:\/|^)(\d+)(?:\/|$)/)
  return pathMatch?.[1]
}

const useAppId = () => {
  const [appId, setAppId] = useState<string>()
  const routeAppId = parseRouteAppId()

  useEffect(() => {
    let ignore = false

    async function getNonSteamAppId(gameName?: string) {
      if (ignore || !gameName?.length) {
        setAppId(undefined)
        return
      }

      try {
        const res = await fetchNoCors(
          `https://steamcommunity.com/actions/SearchApps/${gameName}`,
          {
            method: 'GET'
          }
        )

        if (res.status === 200) {
          const options = (await res.json()) as {
            appid: string
            name: string
          }[]
          const foundAppId = options.find((o) => {
            return cleanString(o.name) === cleanString(gameName)
          })?.appid
          if (!ignore) {
            setAppId(foundAppId)
          }
          return
        }
      } catch (error) {
        console.error(error)
      }

      if (!ignore) {
        setAppId(undefined)
      }
    }

    const targetAppId = routeAppId
    if (!targetAppId) {
      setAppId(undefined)
      return
    }

    const appOverview =
      typeof appStore !== 'undefined'
        ? appStore.GetAppOverviewByGameID(parseInt(targetAppId, 10))
        : undefined
    const isSteamGame = Boolean(
      appTypes[appOverview?.app_type as keyof typeof appTypes]
    )

    if (isSteamGame) {
      if (!ignore) {
        setAppId(targetAppId)
      }
      return
    }

    getNonSteamAppId(appOverview?.display_name)

    return () => {
      ignore = true
    }
  }, [routeAppId])

  return appId
}

export default useAppId

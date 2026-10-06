import { useCallback, useEffect, useState } from 'react'

import ProtonDBTier from '../../types/ProtonDBTier'
import { getLinuxInfo, getProtonDBInfo } from '../actions/protondb'
import { getCache, updateCache } from '../cache/protobDbCache'
import { isOutdated } from '../lib/time'

const useBadgeData = (appId: string | undefined) => {
  const [protonDBTier, setProtonDBTier] = useState<ProtonDBTier>()
  const [linuxSupport, setLinuxSupport] = useState<boolean>(false)

  const loadBadgeData = useCallback(
    async (forceRefresh = false) => {
      if (!appId) {
        setProtonDBTier(undefined)
        setLinuxSupport(false)
        return
      }

      let ignore = false
      const cache = await getCache(appId)

      const cachedTier = cache?.tier
      const cachedLinuxSupport =
        typeof cache?.linuxSupport === 'boolean' ? cache.linuxSupport : undefined
      const shouldRefresh =
        forceRefresh ||
        !cachedTier ||
        typeof cachedLinuxSupport !== 'boolean' ||
        !cache?.lastUpdated ||
        isOutdated(cache.lastUpdated)

      if (!ignore && cachedTier) {
        setProtonDBTier(cachedTier)
      }
      if (!ignore && typeof cachedLinuxSupport === 'boolean') {
        setLinuxSupport(cachedLinuxSupport)
      }

      if (!shouldRefresh) {
        return
      }

      const [tier, linuxState] = await Promise.all([
        getProtonDBInfo(appId),
        getLinuxInfo(appId)
      ])

      if (ignore) {
        return
      }

      const nextTier = tier || cachedTier
      const nextLinuxSupport =
        typeof linuxState === 'boolean' ? linuxState : cachedLinuxSupport ?? false

      if (nextTier) {
        setProtonDBTier(nextTier)
      }
      setLinuxSupport(nextLinuxSupport)

      await updateCache(appId, {
        tier: nextTier,
        linuxSupport: nextLinuxSupport,
        lastUpdated: new Date().toISOString()
      })

      return () => {
        ignore = true
      }
    },
    [appId]
  )

  const refresh = useCallback(async () => {
    await loadBadgeData(true)
  }, [loadBadgeData])

  useEffect(() => {
    let mounted = true

    const getData = async () => {
      if (!appId) {
        setProtonDBTier(undefined)
        setLinuxSupport(false)
        return
      }

      const cache = await getCache(appId)
      if (!mounted) return

      const cachedTier = cache?.tier
      const cachedLinuxSupport =
        typeof cache?.linuxSupport === 'boolean' ? cache.linuxSupport : undefined

      if (cachedTier) {
        setProtonDBTier(cachedTier)
      }
      if (typeof cachedLinuxSupport === 'boolean') {
        setLinuxSupport(cachedLinuxSupport)
      }

      if (!cache?.lastUpdated || isOutdated(cache.lastUpdated)) {
        const [tier, linuxState] = await Promise.all([
          getProtonDBInfo(appId),
          getLinuxInfo(appId)
        ])

        if (!mounted) return

        const nextTier = tier || cachedTier
        const nextLinuxSupport =
          typeof linuxState === 'boolean' ? linuxState : cachedLinuxSupport ?? false

        if (nextTier) {
          setProtonDBTier(nextTier)
        }
        setLinuxSupport(nextLinuxSupport)

        await updateCache(appId, {
          tier: nextTier,
          linuxSupport: nextLinuxSupport,
          lastUpdated: new Date().toISOString()
        })
      }
    }

    getData()

    return () => {
      mounted = false
    }
  }, [appId])

  return {
    protonDBTier,
    linuxSupport,
    refresh
  }
}

export default useBadgeData

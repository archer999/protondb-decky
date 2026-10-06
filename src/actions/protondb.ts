import { fetchNoCors } from '@decky/api'
import ProtonDBTier from '../../types/ProtonDBTier'

export async function getProtonDBInfo(
  appId: string
): Promise<ProtonDBTier | undefined> {
  try {
    const res = await fetchNoCors(
      `https://www.protondb.com/api/v1/reports/summaries/${appId}.json`,
      { method: 'GET' }
    )

    if (res.status === 200) {
      return (await res.json())?.tier
    }
  } catch {
    return 'pending'
  }

  return undefined
}

export async function getLinuxInfo(appId: string): Promise<boolean> {
  try {
    const res = await fetchNoCors(
      `https://store.steampowered.com/api/appdetails/?appids=${appId}`,
      { method: 'GET' }
    )

    if (res.status === 200) {
      return Boolean((await res.json())?.[appId]?.data?.platforms?.linux)
    }
  } catch {
    return false
  }

  return false
}

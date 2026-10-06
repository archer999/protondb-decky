import os

import decky_plugin

from settings import SettingsManager


class Plugin:
    def __init__(self):
        self.settings = None

    async def _main(self):
        settings_directory = getattr(
            decky_plugin,
            'DECKY_PLUGIN_SETTINGS_DIR',
            os.path.join(os.path.dirname(__file__), 'settings')
        )
        if not settings_directory:
            settings_directory = os.path.join(os.path.dirname(__file__), 'settings')

        self.settings = SettingsManager(
            name='config',
            settings_directory=settings_directory
        )

    async def _unload(self):
        pass

    async def set_setting(self, key, value):
        if self.settings is None:
            await self._main()
        return self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        if self.settings is None:
            await self._main()
        return self.settings.getSetting(key, default)

    async def get_system_info(self):
        """
        Get system information including plugin version, OS, and Decky version.
        Returns: {"plugin_version": str, "os_name": str, "os_version": str, "decky_version": str}
        """
        try:
            plugin_version = getattr(decky_plugin, 'DECKY_PLUGIN_VERSION', 'unknown')

            os_name = 'Linux'
            os_version = 'unknown'
            os_release_path = '/etc/os-release'
            if os.path.exists(os_release_path):
                try:
                    with open(os_release_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.startswith('NAME='):
                                os_name = line.split('=')[1].strip().strip('"')
                            elif line.startswith('VERSION_ID='):
                                os_version = line.split('=')[1].strip().strip('"')
                except Exception:
                    pass

            decky_version = getattr(decky_plugin, 'DECKY_VERSION', 'unknown')

            return {
                'plugin_version': plugin_version,
                'os_name': os_name,
                'os_version': os_version,
                'decky_version': str(decky_version)
            }
        except Exception as e:
            print(f'Error getting system info: {e}')
            return {
                'plugin_version': 'unknown',
                'os_name': 'unknown',
                'os_version': 'unknown',
                'decky_version': 'unknown'
            }


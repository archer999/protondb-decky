import json
import os
from typing import Any


class SettingsManager:
    def __init__(self, name: str = 'config', settings_directory: str = '.'):
        self.name = name
        self.settings_directory = settings_directory
        self.settings_path = os.path.join(settings_directory, f'{name}.json')

        os.makedirs(self.settings_directory, exist_ok=True)
        self.settings = self._load_settings()

    def _load_settings(self) -> dict[str, Any]:
        if os.path.isfile(self.settings_path):
            try:
                with open(self.settings_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    return data if isinstance(data, dict) else {}
            except Exception as e:
                print(f'[SettingsManager] Failed to load settings: {e}')
        return {}

    def save_settings(self):
        try:
            with open(self.settings_path, 'w', encoding='utf-8') as file:
                json.dump(self.settings, file, indent=4)
        except Exception as e:
            print(f'[SettingsManager] Failed to save settings: {e}')

    def getSetting(self, key: str, default: Any = None):
        return self.settings.get(key, default)

    def setSetting(self, key: str, value: Any):
        self.settings[key] = value
        self.save_settings()
        return value

    def getSettings(self) -> dict[str, Any]:
        return self.settings.copy()

    def removeSetting(self, key: str):
        if key in self.settings:
            del self.settings[key]
            self.save_settings()
        return self.settings.copy()

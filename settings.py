import json
import os
from typing import Any


class SettingsManager:
    def __init__(self, name: str, settings_directory: str | None = None):
        self.name = name
        self.settings_directory = settings_directory or os.getcwd()
        self.settings_path = os.path.join(self.settings_directory, f"{name}.json")

    def _ensure_directory(self) -> None:
        os.makedirs(self.settings_directory, exist_ok=True)

    def load(self) -> dict[str, Any]:
        if not os.path.exists(self.settings_path):
            return {}

        try:
            with open(self.settings_path, "r", encoding="utf-8") as file:
                data = json.load(file)
                return data if isinstance(data, dict) else {}
        except (json.JSONDecodeError, OSError):
            return {}

    def setSetting(self, key: str, value: Any):
        self._ensure_directory()
        settings = self.load()
        settings[key] = value
        with open(self.settings_path, "w", encoding="utf-8") as file:
            json.dump(settings, file, indent=2)
        return value

    def getSetting(self, key: str, default: Any = None):
        return self.load().get(key, default)

    def getSettings(self) -> dict[str, Any]:
        return self.load()

    def removeSetting(self, key: str):
        settings = self.load()
        if key in settings:
            del settings[key]
            self._ensure_directory()
            with open(self.settings_path, "w", encoding="utf-8") as file:
                json.dump(settings, file, indent=2)
        return settings

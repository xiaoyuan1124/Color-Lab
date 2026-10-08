"""Regressions for app-level permission keys in the generated Xcode project."""
import copy
import pathlib
import plistlib
import subprocess
import tempfile
import unittest


PATCH = pathlib.Path(__file__).with_name("patch-ios-project.mjs")
APP_ENTRIES = {
    "NSCameraUsageDescription": "拍攝照片以在此裝置上取色與分析配色。",
    "NSPhotoLibraryUsageDescription": "選擇照片以在此裝置上取色與分析配色。",
    "ITSAppUsesNonExemptEncryption": False,
}
BASE = {
    "CFBundleDisplayName": "Color Lab",
    "UIApplicationSceneManifest": {
        "UIApplicationSupportsMultipleScenes": False,
        "UISceneConfigurations": {
            "UIWindowSceneSessionRoleApplication": [{
                "UISceneConfigurationName": "Default Configuration",
                "UISceneDelegateClassName": "$(PRODUCT_MODULE_NAME).SceneDelegate",
                "UISceneStoryboardFile": "Main",
            }],
        },
    },
    "UISupportedInterfaceOrientations": ["UIInterfaceOrientationPortrait"],
}
PROJECT = """TARGETED_DEVICE_FAMILY = "1,2";
MARKETING_VERSION = 1.0;
CURRENT_PROJECT_VERSION = 1;
"""


class IOSProjectPatchTests(unittest.TestCase):
    def check_patch(self, initial):
        with tempfile.TemporaryDirectory(prefix="color-lab-ios-project-") as directory:
            root = pathlib.Path(directory)
            plist_path = root / "ios/App/App/Info.plist"
            project_path = root / "ios/App/App.xcodeproj/project.pbxproj"
            plist_path.parent.mkdir(parents=True)
            project_path.parent.mkdir(parents=True)
            plist_path.write_bytes(plistlib.dumps(initial, sort_keys=False))
            project_path.write_text(PROJECT, encoding="utf-8")
            subprocess.run(["node", str(PATCH)], cwd=root, check=True, capture_output=True)
            actual = plistlib.loads(plist_path.read_bytes())
            for key, value in APP_ENTRIES.items():
                self.assertIn(key, actual, f"{key} must be in the app root dictionary")
                self.assertEqual(actual[key], value)
            expected = copy.deepcopy(BASE)
            expected.update(APP_ENTRIES)
            self.assertEqual(actual, expected, "Scene configuration and unrelated keys must survive")
            self.assertIn("TARGETED_DEVICE_FAMILY = 1;", project_path.read_text())
            self.assertIn("MARKETING_VERSION = 1.0.0;", project_path.read_text())
            once = (plist_path.read_bytes(), project_path.read_bytes())
            subprocess.run(["node", str(PATCH)], cwd=root, check=True, capture_output=True)
            self.assertEqual((plist_path.read_bytes(), project_path.read_bytes()), once,
                             "ios:sync must keep the patch idempotent")

    def test_fresh_scene_manifest_gets_app_level_permissions(self):
        self.check_patch(copy.deepcopy(BASE))

    def test_sync_repairs_permissions_nested_by_previous_patch(self):
        initial = copy.deepcopy(BASE)
        scene = initial["UIApplicationSceneManifest"]["UISceneConfigurations"]["UIWindowSceneSessionRoleApplication"][0]
        scene.update(APP_ENTRIES)
        self.check_patch(initial)

    def test_existing_root_permissions_remain_valid_after_sync(self):
        initial = copy.deepcopy(BASE)
        initial.update(APP_ENTRIES)
        self.check_patch(initial)


if __name__ == "__main__":
    unittest.main()

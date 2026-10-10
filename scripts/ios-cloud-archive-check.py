#!/usr/bin/env python3
"""Fail-closed inspection of a *unsigned* iPhoneOS Release .xcarchive.

This proves cloud archive reproducibility, NOT App Store signing or device acceptance.
No keys, provisioning profiles, network calls or production Apple actions are used.
"""
import hashlib
import json
import os
from pathlib import Path
import plistlib
import subprocess
import sys


def require(condition, message):
    if not condition:
        raise SystemExit("FAIL cloud iOS archive: " + message)


def main():
    require(len(sys.argv) == 3, "usage: ios-cloud-archive-check.py ARCHIVE OUTPUT_JSON")
    archive = Path(sys.argv[1])
    output = Path(sys.argv[2])
    apps = sorted((archive / "Products" / "Applications").glob("*.app"))
    require(len(apps) == 1, "archive must contain exactly one .app")
    app = apps[0]
    info_path = app / "Info.plist"
    require(info_path.is_file(), "compiled Info.plist missing")
    with info_path.open("rb") as stream:
        info = plistlib.load(stream)

    expected = {
        "CFBundleIdentifier": "com.sy1124.colorlab",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "NSCameraUsageDescription": "拍攝照片以在此裝置上取色與分析配色。",
        "NSPhotoLibraryUsageDescription": "選擇照片以在此裝置上取色與分析配色。",
        "ITSAppUsesNonExemptEncryption": False,
    }
    for key, value in expected.items():
        require(info.get(key) == value, f"compiled {key} unexpected: {info.get(key)!r}")
    require(info.get("UIDeviceFamily") == [1], "archive must be iPhone-only")
    require(info.get("CFBundleExecutable"), "compiled executable missing")
    require((app / str(info["CFBundleExecutable"])).is_file(), "app executable missing")
    require(not (app / "embedded.mobileprovision").exists(), "unsigned archive must not embed provisioning")
    require(not (app / "_CodeSignature").exists(), "unsigned app must not be code signed")

    public = app / "public"
    require((public / "index.html").is_file(), "offline local app index missing")
    require(not (public / "sw.js").exists(), "PWA service worker forbidden in native app")
    require((public / "THIRD_PARTY_NOTICES.md").is_file(), "bundled third-party notices missing")
    require((public / "runtime" / "native-app-lifecycle.js").is_file(),
            "Capacitor lifecycle script missing")
    meta_file = public / "native-build.json"
    require(meta_file.is_file(), "bundled native identity manifest missing")
    meta = json.loads(meta_file.read_text(encoding="utf-8"))
    require(meta.get("source") == "bundled-local-assets", "remote shell forbidden")
    require(meta.get("nativeShellVersion") == "1.0.0", "native shell version mismatch")
    require(meta.get("colorLabEngineVersion") == "2.53.0", "engine version mismatch")
    manifests = list(app.rglob("PrivacyInfo.xcprivacy"))
    require(manifests, "compiled app privacy manifest missing")

    sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    if os.getenv("GITHUB_SHA"):
        require(sha == os.environ["GITHUB_SHA"], "CI checkout SHA mismatch")
    xcode = subprocess.check_output(["xcodebuild", "-version"], text=True).strip()
    require(xcode.startswith("Xcode 26."), "Xcode 26 SDK baseline missing")
    artifact = {
        "status": "PASS_UNSIGNED_ARCHIVE_ONLY",
        "signed": False,
        "ipaCreated": False,
        "testflightUploaded": False,
        "realIphoneTested": False,
        "appStoreSubmissionReady": False,
        "commit": sha,
        "ref": os.getenv("GITHUB_REF", "local"),
        "xcode": xcode.splitlines(),
        "bundleId": info["CFBundleIdentifier"],
        "appVersion": info["CFBundleShortVersionString"],
        "buildNumber": info["CFBundleVersion"],
        "target": "iphoneos (device) / Release / unsigned",
        "privacyManifestCount": len(manifests),
        "offlineIndexSha256": hashlib.sha256((public / "index.html").read_bytes()).hexdigest(),
        "source": meta["source"],
        "externalBlockers": [
            "support-contact", "app-review-contact", "copyright", "content-rights",
            "dsa-status", "Apple Team/signing", "real iPhone acceptance",
        ],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS: unsigned device Release archive / app Info.plist / local shell / privacy")
    print("PASS: archive identity", sha, info["CFBundleIdentifier"], "v" + info["CFBundleShortVersionString"])
    print("NOT DONE: code signing, IPA export, TestFlight, physical iPhone, Apple submission")


if __name__ == "__main__":
    main()

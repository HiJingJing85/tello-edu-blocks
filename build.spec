# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller 빌드 설정
- Windows: pyinstaller build.spec
- macOS: pyinstaller build.spec
- 단일 실행파일 생성, Flask 템플릿/정적 파일 포함
"""

import os

block_cipher = None

# 프로젝트 루트 경로
ROOT = os.path.dirname(os.path.abspath(SPEC))

a = Analysis(
    ['app.py'],
    pathex=[ROOT],
    binaries=[],
    # Flask 템플릿, 정적 파일, Blockly 라이브러리를 번들에 포함
    datas=[
        (os.path.join(ROOT, 'templates'), 'templates'),
        (os.path.join(ROOT, 'static'), 'static'),
    ],
    hiddenimports=['flask'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='TelloEDU',       # 실행파일 이름
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,           # 콘솔 표시 (서버 로그 확인용)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

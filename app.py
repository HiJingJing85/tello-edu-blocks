"""
Tello EDU 블록코딩 서비스 - Flask 웹 서버
- 블록코딩 UI 서빙
- REST API로 Tello 명령 중계
- 서버 시작 시 브라우저 자동 열기
"""

import sys
import os
import json
import time
import webbrowser
import threading
from flask import Flask, render_template, request, jsonify

from tello import Tello

# PyInstaller 패키징 시 리소스 경로 처리
if getattr(sys, 'frozen', False):
    # PyInstaller로 빌드된 실행파일인 경우
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

# Tello 인스턴스 (전역)
tello = None


@app.route('/')
def index():
    """블록코딩 메인 페이지"""
    return render_template('index.html')


@app.route('/api/connect', methods=['POST'])
def connect():
    """Tello에 연결 (SDK 모드 진입)"""
    global tello
    try:
        # 기존 연결이 있으면 정리
        if tello:
            tello.close()
        tello = Tello()
        response = tello.connect()
        return jsonify({
            'success': response == 'ok',
            'message': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'연결 실패: {str(e)}'
        })


@app.route('/api/command', methods=['POST'])
def command():
    """단일 Tello 명령 실행"""
    global tello
    if not tello or not tello.connected:
        return jsonify({
            'success': False,
            'message': '드론이 연결되지 않았습니다.'
        })

    data = request.get_json()
    cmd = data.get('command', '')

    if not cmd:
        return jsonify({
            'success': False,
            'message': '명령이 비어있습니다.'
        })

    response = tello.send_command(cmd)
    return jsonify({
        'success': 'error' not in response.lower(),
        'message': response,
        'command': cmd
    })


@app.route('/api/execute', methods=['POST'])
def execute():
    """
    블록에서 생성된 명령 시퀀스를 순차 실행
    요청 형식: {"commands": ["takeoff", "up 50", "land"]}
    """
    global tello
    if not tello or not tello.connected:
        return jsonify({
            'success': False,
            'message': '드론이 연결되지 않았습니다.',
            'results': []
        })

    data = request.get_json()
    commands = data.get('commands', [])
    results = []

    for cmd in commands:
        # 대기 명령 처리 (wait:초)
        if cmd.startswith('wait:'):
            wait_sec = float(cmd.split(':')[1])
            time.sleep(wait_sec)
            results.append({
                'command': f'{wait_sec}초 대기',
                'response': 'ok',
                'success': True
            })
            continue

        response = tello.send_command(cmd)
        success = 'error' not in response.lower()
        results.append({
            'command': cmd,
            'response': response,
            'success': success
        })

        # 명령 간 짧은 간격 (드론 안정성)
        time.sleep(0.5)

        # 실패 시 중단
        if not success:
            break

    return jsonify({
        'success': all(r['success'] for r in results),
        'results': results
    })


@app.route('/api/status', methods=['GET'])
def status():
    """드론 상태 조회"""
    global tello
    if not tello or not tello.connected:
        return jsonify({
            'connected': False,
            'state': {}
        })

    return jsonify({
        'connected': True,
        'state': tello.get_state()
    })


@app.route('/api/emergency', methods=['POST'])
def emergency():
    """긴급 정지 - 모터 즉시 중단"""
    global tello
    if tello and tello.connected:
        response = tello.send_command('emergency')
        return jsonify({
            'success': True,
            'message': response
        })
    return jsonify({
        'success': False,
        'message': '드론이 연결되지 않았습니다.'
    })


@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    """Tello 연결 해제"""
    global tello
    if tello:
        # 안전하게 착륙 시도
        if tello.connected:
            tello.send_command('land')
        tello.close()
        tello = None
    return jsonify({'success': True, 'message': '연결 해제됨'})


def open_browser():
    """서버 시작 후 브라우저 자동 열기"""
    time.sleep(1.5)
    port = int(os.environ.get('PORT', 5050))
    webbrowser.open(f'http://127.0.0.1:{port}')


if __name__ == '__main__':
    # 브라우저 자동 열기 (별도 스레드)
    threading.Thread(target=open_browser, daemon=True).start()

    port = int(os.environ.get('PORT', 5050))

    print('=' * 50)
    print('  Tello EDU 블록코딩 서비스')
    print(f'  http://127.0.0.1:{port}')
    print('  종료하려면 Ctrl+C를 누르세요')
    print('=' * 50)

    app.run(host='127.0.0.1', port=port, debug=False)

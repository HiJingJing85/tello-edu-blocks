"""
Tello EDU 드론 UDP 통신 모듈
- SDK 2.0 프로토콜 기반
- 명령 포트: UDP 8889, 상태 포트: UDP 8890
"""

import socket
import threading
import time


class Tello:
    """Tello EDU 드론과 UDP 소켓으로 통신하는 클래스"""

    # Tello 기본 네트워크 설정
    TELLO_IP = '192.168.10.1'
    COMMAND_PORT = 8889
    STATE_PORT = 8890
    # 명령 응답 대기 타임아웃 (초)
    TIMEOUT = 10

    def __init__(self):
        # 명령 송수신용 UDP 소켓
        self.command_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.command_socket.settimeout(self.TIMEOUT)
        self.command_socket.bind(('', self.COMMAND_PORT))

        # 드론 상태 정보 저장
        self.state = {}
        # 연결 상태 플래그
        self.connected = False
        # 상태 수신 스레드 실행 플래그
        self._state_running = False
        self._state_thread = None

    def connect(self):
        """SDK 모드 진입 - 'command' 명령 전송"""
        response = self.send_command('command')
        if response == 'ok':
            self.connected = True
            # 상태 수신 스레드 시작
            self._start_state_receiver()
        return response

    def send_command(self, command):
        """
        Tello에 명령을 전송하고 응답을 반환
        - command: 전송할 SDK 명령 문자열
        - 반환: 'ok', 'error', 또는 읽기 명령의 응답값
        """
        try:
            self.command_socket.sendto(
                command.encode('utf-8'),
                (self.TELLO_IP, self.COMMAND_PORT)
            )
            # 응답 수신 대기
            response, _ = self.command_socket.recvfrom(1024)
            return response.decode('utf-8').strip()
        except socket.timeout:
            return 'error: timeout'
        except OSError as e:
            return f'error: {str(e)}'

    def _start_state_receiver(self):
        """드론 상태 정보를 수신하는 백그라운드 스레드 시작"""
        if self._state_running:
            return
        self._state_running = True
        self._state_thread = threading.Thread(
            target=self._receive_state, daemon=True
        )
        self._state_thread.start()

    def _receive_state(self):
        """
        포트 8890에서 드론 상태 데이터를 지속적으로 수신
        상태 형식: "pitch:0;roll:0;yaw:0;vgx:0;..."
        """
        state_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        state_socket.settimeout(3)
        state_socket.bind(('', self.STATE_PORT))

        while self._state_running:
            try:
                data, _ = state_socket.recvfrom(1024)
                # 상태 문자열 파싱 → 딕셔너리로 변환
                state_str = data.decode('utf-8').strip()
                self.state = self._parse_state(state_str)
            except socket.timeout:
                continue
            except Exception:
                continue

        state_socket.close()

    def _parse_state(self, state_str):
        """
        상태 문자열을 딕셔너리로 파싱
        예: "pitch:0;roll:0;yaw:0;" → {"pitch": "0", "roll": "0", "yaw": "0"}
        """
        result = {}
        for item in state_str.split(';'):
            if ':' in item:
                key, value = item.split(':', 1)
                result[key.strip()] = value.strip()
        return result

    def get_state(self):
        """현재 드론 상태 딕셔너리 반환"""
        return self.state.copy()

    def close(self):
        """소켓 및 스레드 정리"""
        self._state_running = False
        if self._state_thread:
            self._state_thread.join(timeout=3)
        self.command_socket.close()
        self.connected = False

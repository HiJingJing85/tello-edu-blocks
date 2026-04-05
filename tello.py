"""
Tello EDU 드론 UDP 통신 모듈
- SDK 2.0 프로토콜 기반
- 명령 포트: UDP 8889, 상태 포트: UDP 8890
"""

import socket
import sys
import threading
import time


class Tello:
    """Tello EDU 드론과 UDP 소켓으로 통신하는 클래스"""

    TELLO_IP = '192.168.10.1'
    COMMAND_PORT = 8889
    STATE_PORT = 8890
    TIMEOUT = 20

    def __init__(self):
        # 명령 송수신용 단일 소켓 (OS가 포트 자동 할당)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.settimeout(self.TIMEOUT)

        # 드론 상태
        self.state = {}
        self.connected = False
        self._state_running = False
        self._state_thread = None
        self._lock = threading.Lock()

        self._log('Tello 객체 생성됨')

    def _log(self, msg):
        """즉시 출력되는 로그"""
        print(f'[TELLO] {msg}', flush=True)

    def connect(self):
        """SDK 모드 진입"""
        self._log('SDK 모드 연결 시도...')
        response = self.send_command('command')
        if response == 'ok':
            self.connected = True
            self._start_state_receiver()
            self._log('연결 성공!')
        else:
            self._log(f'연결 실패: {response}')
        return response

    def send_command(self, command):
        """명령 전송 후 응답 대기"""
        with self._lock:
            try:
                # 수신 버퍼 비우기
                self.sock.setblocking(False)
                try:
                    while True:
                        self.sock.recvfrom(1024)
                except BlockingIOError:
                    pass
                self.sock.setblocking(True)
                self.sock.settimeout(self.TIMEOUT)

                # 명령 전송
                self._log(f'전송: {command}')
                self.sock.sendto(
                    command.encode('utf-8'),
                    (self.TELLO_IP, self.COMMAND_PORT)
                )

                # 응답 수신
                response, addr = self.sock.recvfrom(1024)
                result = response.decode('utf-8').strip()
                self._log(f'응답: {result}')
                return result

            except socket.timeout:
                self._log(f'타임아웃: {command}')
                return 'error: timeout'
            except OSError as e:
                self._log(f'오류: {command} → {e}')
                return f'error: {str(e)}'

    def _start_state_receiver(self):
        if self._state_running:
            return
        self._state_running = True
        self._state_thread = threading.Thread(
            target=self._receive_state, daemon=True
        )
        self._state_thread.start()

    def _receive_state(self):
        state_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        state_socket.settimeout(3)
        state_socket.bind(('', self.STATE_PORT))

        while self._state_running:
            try:
                data, _ = state_socket.recvfrom(1024)
                state_str = data.decode('utf-8').strip()
                self.state = self._parse_state(state_str)
            except socket.timeout:
                continue
            except Exception:
                continue

        state_socket.close()

    def _parse_state(self, state_str):
        result = {}
        for item in state_str.split(';'):
            if ':' in item:
                key, value = item.split(':', 1)
                result[key.strip()] = value.strip()
        return result

    def get_state(self):
        return self.state.copy()

    def close(self):
        self._state_running = False
        if self._state_thread:
            self._state_thread.join(timeout=3)
        self.sock.close()
        self.connected = False
        self._log('연결 종료')

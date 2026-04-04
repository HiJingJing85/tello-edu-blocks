/**
 * Tello EDU 블록코딩 프론트엔드 로직
 * - Blockly 워크스페이스 초기화
 * - 드론 연결/해제
 * - 블록 → 명령 변환 및 실행
 * - 실행 로그 표시
 * - 상태 모니터링
 */

// ===== 전역 변수 =====
let workspace = null;    // Blockly 워크스페이스 인스턴스
let isConnected = false; // 드론 연결 상태
let isRunning = false;   // 명령 실행 중 여부
let statusInterval = null; // 상태 폴링 타이머

// ===== Blockly 툴박스 정의 =====
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '기본 제어',
      categorystyle: 'control_category',
      contents: [
        { kind: 'block', type: 'tello_takeoff' },
        { kind: 'block', type: 'tello_land' },
        { kind: 'block', type: 'tello_stop' },
        { kind: 'block', type: 'tello_emergency' }
      ]
    },
    {
      kind: 'category',
      name: '이동',
      categorystyle: 'move_category',
      contents: [
        { kind: 'block', type: 'tello_move' }
      ]
    },
    {
      kind: 'category',
      name: '회전',
      categorystyle: 'rotate_category',
      contents: [
        { kind: 'block', type: 'tello_rotate' }
      ]
    },
    {
      kind: 'category',
      name: '플립',
      categorystyle: 'flip_category',
      contents: [
        { kind: 'block', type: 'tello_flip' }
      ]
    },
    {
      kind: 'category',
      name: '속도',
      categorystyle: 'speed_category',
      contents: [
        { kind: 'block', type: 'tello_speed' }
      ]
    },
    {
      kind: 'category',
      name: '고급 이동',
      categorystyle: 'advanced_category',
      contents: [
        { kind: 'block', type: 'tello_go' },
        { kind: 'block', type: 'tello_curve' }
      ]
    },
    {
      kind: 'category',
      name: '미션패드',
      categorystyle: 'mission_category',
      contents: [
        { kind: 'block', type: 'tello_mission_on' },
        { kind: 'block', type: 'tello_mission_off' },
        { kind: 'block', type: 'tello_mission_direction' },
        { kind: 'block', type: 'tello_go_mid' },
        { kind: 'block', type: 'tello_jump' }
      ]
    },
    {
      kind: 'category',
      name: '흐름 제어',
      categorystyle: 'flow_category',
      contents: [
        { kind: 'block', type: 'tello_wait' },
        { kind: 'block', type: 'tello_repeat' }
      ]
    }
  ]
};

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  initBlockly();
  setupEventListeners();
});

/**
 * Blockly 워크스페이스 초기화
 */
function initBlockly() {
  // 학생 친화적 커스텀 테마
  const telloTheme = Blockly.Theme.defineTheme('telloEdu', {
    name: 'telloEdu',
    base: Blockly.Themes.Classic,
    // 블록 카테고리별 색상 (채도 높게)
    blockStyles: {
      control_blocks: { colourPrimary: '#FF6B6B', colourSecondary: '#FF8E8E', colourTertiary: '#D94F4F' },
      move_blocks: { colourPrimary: '#4DABF7', colourSecondary: '#74C0FC', colourTertiary: '#339AF0' },
      rotate_blocks: { colourPrimary: '#51CF66', colourSecondary: '#69DB7C', colourTertiary: '#40C057' },
      flip_blocks: { colourPrimary: '#CC5DE8', colourSecondary: '#DA77F2', colourTertiary: '#AE3EC9' },
      speed_blocks: { colourPrimary: '#FF922B', colourSecondary: '#FFA94D', colourTertiary: '#F76707' },
      advanced_blocks: { colourPrimary: '#22B8CF', colourSecondary: '#3BC9DB', colourTertiary: '#15AABF' },
      mission_blocks: { colourPrimary: '#F06595', colourSecondary: '#F783AC', colourTertiary: '#E64980' },
      flow_blocks: { colourPrimary: '#94D82D', colourSecondary: '#A9E34B', colourTertiary: '#82C91E' }
    },
    // 카테고리 색상
    categoryStyles: {
      control_category: { colour: '#FF6B6B' },
      move_category: { colour: '#4DABF7' },
      rotate_category: { colour: '#51CF66' },
      flip_category: { colour: '#CC5DE8' },
      speed_category: { colour: '#FF922B' },
      advanced_category: { colour: '#22B8CF' },
      mission_category: { colour: '#F06595' },
      flow_category: { colour: '#94D82D' }
    },
    componentStyles: {
      workspaceBackgroundColour: '#FAFAFA',
      toolboxBackgroundColour: '#FFFFFF',
      toolboxForegroundColour: '#333333',
      flyoutBackgroundColour: '#F5F5F5',
      flyoutForegroundColour: '#333333',
      flyoutOpacity: 0.98,
      scrollbarColour: '#DDD',
      scrollbarOpacity: 0.6,
      insertionMarkerColour: '#333333',
      insertionMarkerOpacity: 0.3
    },
    // 폰트 크기 키움
    fontStyle: {
      family: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
      weight: 'bold',
      size: 13
    },
    startHats: true
  });

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    theme: telloTheme,
    // 그리드 비활성화 (점 제거, 깔끔한 배경)
    grid: null,
    // 줌 설정
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    // 휴지통 활성화
    trashcan: true,
    // 스크롤바 활성화
    scrollbars: true,
    // 소리 활성화
    sounds: true,
    // Zelos 렌더러 (둥근 블록, 학생 친화적)
    renderer: 'zelos'
  });

  // 워크스페이스 변경 시 코드 미리보기 업데이트
  workspace.addChangeListener(updateCodePreview);
}

/**
 * 이벤트 리스너 등록
 */
function setupEventListeners() {
  // 연결 버튼
  document.getElementById('btnConnect').addEventListener('click', connectDrone);
  // 해제 버튼
  document.getElementById('btnDisconnect').addEventListener('click', disconnectDrone);
  // 실행 버튼
  document.getElementById('btnRun').addEventListener('click', runBlocks);
  // 긴급정지 버튼
  document.getElementById('btnEmergency').addEventListener('click', emergencyStop);
  // 코드 보기 탭 전환
  document.getElementById('tabBlocks').addEventListener('click', () => switchTab('blocks'));
  document.getElementById('tabCode').addEventListener('click', () => switchTab('code'));
  // 워크스페이스 저장/불러오기
  document.getElementById('btnSave').addEventListener('click', saveWorkspace);
  document.getElementById('btnLoad').addEventListener('click', loadWorkspace);
  // 워크스페이스 초기화
  document.getElementById('btnClear').addEventListener('click', clearWorkspace);
}

// ===== 드론 연결 =====

/**
 * Tello 드론에 연결
 */
async function connectDrone() {
  addLog('📡 드론 연결 시도 중...', 'info');
  updateConnectionUI('connecting');

  try {
    const response = await fetch('/api/connect', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      isConnected = true;
      updateConnectionUI('connected');
      addLog('✅ 드론 연결 성공!', 'success');
      // 상태 폴링 시작
      startStatusPolling();
    } else {
      updateConnectionUI('disconnected');
      addLog('❌ 연결 실패: ' + data.message, 'error');
    }
  } catch (err) {
    updateConnectionUI('disconnected');
    addLog('❌ 서버 통신 오류: ' + err.message, 'error');
  }
}

/**
 * 드론 연결 해제
 */
async function disconnectDrone() {
  try {
    await fetch('/api/disconnect', { method: 'POST' });
  } catch (err) {
    // 무시
  }
  isConnected = false;
  updateConnectionUI('disconnected');
  stopStatusPolling();
  addLog('🔌 드론 연결 해제됨', 'info');
}

/**
 * 연결 상태에 따른 UI 업데이트
 */
function updateConnectionUI(state) {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const statusGuide = document.getElementById('statusGuide');
  const btnConnect = document.getElementById('btnConnect');
  const btnDisconnect = document.getElementById('btnDisconnect');
  const btnRun = document.getElementById('btnRun');

  switch (state) {
    case 'connected':
      statusDot.className = 'status-dot connected';
      statusText.textContent = '연결됨';
      statusGuide.textContent = 'Tello EDU와 연결되어 있습니다';
      btnConnect.disabled = true;
      btnDisconnect.disabled = false;
      btnRun.disabled = false;
      break;
    case 'connecting':
      statusDot.className = 'status-dot connecting';
      statusText.textContent = '연결 중...';
      statusGuide.textContent = 'Tello에 연결을 시도하고 있습니다';
      btnConnect.disabled = true;
      btnDisconnect.disabled = true;
      btnRun.disabled = true;
      break;
    case 'disconnected':
    default:
      statusDot.className = 'status-dot';
      statusText.textContent = '연결 안 됨';
      statusGuide.textContent = 'Tello WiFi에 연결 후 연결 버튼을 눌러주세요';
      btnConnect.disabled = false;
      btnDisconnect.disabled = true;
      btnRun.disabled = false;
      break;
  }
}

// ===== 블록 실행 =====

/**
 * 블록에서 생성된 명령을 실행
 */
async function runBlocks() {
  if (isRunning) return;

  // 블록에서 명령어 생성
  const commands = getCommandsFromBlocks();

  if (commands.length === 0) {
    addLog('⚠️ 실행할 블록이 없습니다.', 'warning');
    return;
  }

  isRunning = true;
  document.getElementById('btnRun').disabled = true;

  addLog('▶️ 실행 시작 (' + commands.length + '개 명령)', 'info');
  addLog('━━━━━━━━━━━━━━━━━━━━', 'info');

  // 명령 리스트를 표시
  commands.forEach((cmd, i) => {
    addLog('  ' + (i + 1) + '. ' + cmd, 'info');
  });
  addLog('━━━━━━━━━━━━━━━━━━━━', 'info');

  if (!isConnected) {
    addLog('⚠️ 드론이 연결되지 않았습니다. 시뮬레이션 모드로 실행합니다.', 'warning');
    // 시뮬레이션: 각 명령을 로그에 표시
    for (const cmd of commands) {
      if (cmd.startsWith('wait:')) {
        const sec = parseFloat(cmd.split(':')[1]);
        addLog('⏱️ ' + sec + '초 대기 중...', 'info');
        await sleep(sec * 1000);
        addLog('  → 완료', 'success');
      } else {
        addLog('📤 [시뮬레이션] ' + cmd, 'info');
        await sleep(500);
        addLog('  → ok (시뮬레이션)', 'success');
      }
    }
    addLog('✅ 시뮬레이션 실행 완료!', 'success');
  } else {
    // 실제 드론에 명령 전송
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: commands })
      });
      const data = await response.json();

      // 실행 결과 표시
      data.results.forEach(result => {
        if (result.success) {
          addLog('📤 ' + result.command + ' → ' + result.response, 'success');
        } else {
          addLog('❌ ' + result.command + ' → ' + result.response, 'error');
        }
      });

      if (data.success) {
        addLog('✅ 모든 명령 실행 완료!', 'success');
      } else {
        addLog('⚠️ 일부 명령이 실패했습니다.', 'warning');
      }
    } catch (err) {
      addLog('❌ 실행 오류: ' + err.message, 'error');
    }
  }

  isRunning = false;
  document.getElementById('btnRun').disabled = false;
}

/**
 * 블록 워크스페이스에서 명령 리스트 추출
 */
function getCommandsFromBlocks() {
  // Blockly 코드 생성기로 명령 문자열 생성
  const code = javascript.javascriptGenerator.workspaceToCode(workspace);
  // 줄 단위로 분리, 빈 줄 제거
  return code.split('\n').filter(line => line.trim() !== '');
}

/**
 * 긴급 정지
 */
async function emergencyStop() {
  addLog('🚨 긴급 정지 실행!', 'error');
  try {
    await fetch('/api/emergency', { method: 'POST' });
    addLog('🚨 모터 정지 명령 전송됨', 'error');
  } catch (err) {
    addLog('❌ 긴급 정지 오류: ' + err.message, 'error');
  }
}

// ===== 코드 미리보기 =====

/**
 * 워크스페이스 변경 시 코드 미리보기 업데이트
 */
function updateCodePreview() {
  const codeArea = document.getElementById('codePreview');
  if (!codeArea) return;

  const commands = getCommandsFromBlocks();
  if (commands.length === 0) {
    codeArea.textContent = '// 블록을 추가하면 명령어가 여기에 표시됩니다.';
  } else {
    codeArea.textContent = commands.join('\n');
  }
}

/**
 * 탭 전환 (블록 / 코드)
 */
function switchTab(tab) {
  const tabBlocks = document.getElementById('tabBlocks');
  const tabCode = document.getElementById('tabCode');
  const blocklyDiv = document.getElementById('blocklyDiv');
  const codePanel = document.getElementById('codePanel');

  if (tab === 'blocks') {
    tabBlocks.classList.add('active');
    tabCode.classList.remove('active');
    blocklyDiv.style.display = 'block';
    codePanel.style.display = 'none';
    // Blockly 리사이즈
    Blockly.svgResize(workspace);
  } else {
    tabBlocks.classList.remove('active');
    tabCode.classList.add('active');
    blocklyDiv.style.display = 'none';
    codePanel.style.display = 'block';
    updateCodePreview();
  }
}

// ===== 상태 모니터링 =====

/**
 * 드론 상태 주기적 폴링 시작
 */
function startStatusPolling() {
  stopStatusPolling();
  statusInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      updateStatusPanel(data.state);
    } catch (err) {
      // 무시
    }
  }, 1000);
}

/**
 * 상태 폴링 중지
 */
function stopStatusPolling() {
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
  updateStatusPanel({});
}

/**
 * 상태 패널 UI 업데이트
 */
function updateStatusPanel(state) {
  const batteryEl = document.getElementById('battery');
  const heightEl = document.getElementById('height');
  const tempEl = document.getElementById('temperature');
  const flightTimeEl = document.getElementById('flightTime');

  if (state && Object.keys(state).length > 0) {
    batteryEl.textContent = (state.bat || '-') + '%';
    heightEl.textContent = (state.h || '-') + 'cm';
    // 온도 범위 표시
    const tempL = state.templ || '-';
    const tempH = state.temph || '-';
    tempEl.textContent = tempL + '~' + tempH + '°C';
    flightTimeEl.textContent = (state.time || '-') + 's';
  } else {
    batteryEl.textContent = '-';
    heightEl.textContent = '-';
    tempEl.textContent = '-';
    flightTimeEl.textContent = '-';
  }
}

// ===== 로그 =====

/**
 * 실행 로그에 메시지 추가
 */
function addLog(message, type) {
  const logArea = document.getElementById('logArea');
  const entry = document.createElement('div');
  entry.className = 'log-entry log-' + (type || 'info');

  // 타임스탬프 추가
  const now = new Date();
  const time = now.toLocaleTimeString('ko-KR');
  entry.textContent = '[' + time + '] ' + message;

  logArea.appendChild(entry);
  // 자동 스크롤
  logArea.scrollTop = logArea.scrollHeight;
}

// ===== 저장/불러오기 =====

/**
 * 워크스페이스를 JSON 파일로 저장
 */
function saveWorkspace() {
  const state = Blockly.serialization.workspaces.save(workspace);
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'tello_program.json';
  // 다운로드 완료 후 로그 표시
  a.addEventListener('click', function() {
    setTimeout(function() {
      addLog('프로그램이 저장되었습니다.', 'success');
    }, 500);
  });
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * JSON 파일에서 워크스페이스 불러오기
 */
function loadWorkspace() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const state = JSON.parse(event.target.result);
        Blockly.serialization.workspaces.load(state, workspace);
        addLog('📂 프로그램을 불러왔습니다.', 'success');
      } catch (err) {
        addLog('❌ 파일 읽기 오류: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

/**
 * 워크스페이스 초기화
 */
function clearWorkspace() {
  if (confirm('모든 블록을 삭제하시겠습니까?')) {
    workspace.clear();
    addLog('🗑️ 워크스페이스가 초기화되었습니다.', 'info');
  }
}

// ===== 유틸리티 =====

/**
 * 지정 시간(ms) 대기
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Blockly → Tello 명령어 변환 코드 생성기
 * 각 블록을 Tello SDK 명령 문자열로 변환
 */

// JavaScript 코드 생성기 사용
const telloGenerator = javascript.javascriptGenerator;

// ===== 기본 제어 =====

// 이륙: "takeoff"
telloGenerator.forBlock['tello_takeoff'] = function(block) {
  return 'takeoff\n';
};

// 착륙: "land"
telloGenerator.forBlock['tello_land'] = function(block) {
  return 'land\n';
};

// 긴급정지: "emergency"
telloGenerator.forBlock['tello_emergency'] = function(block) {
  return 'emergency\n';
};

// 호버링: "stop"
telloGenerator.forBlock['tello_stop'] = function(block) {
  return 'stop\n';
};

// ===== 이동 =====

// 방향 이동: "up 50", "forward 100" 등
telloGenerator.forBlock['tello_move'] = function(block) {
  const direction = block.getFieldValue('DIRECTION');
  const distance = block.getFieldValue('DISTANCE');
  return direction + ' ' + distance + '\n';
};

// ===== 회전 =====

// 회전: "cw 90", "ccw 180" 등
telloGenerator.forBlock['tello_rotate'] = function(block) {
  const direction = block.getFieldValue('DIRECTION');
  const angle = block.getFieldValue('ANGLE');
  return direction + ' ' + angle + '\n';
};

// ===== 플립 =====

// 뒤집기: "flip l", "flip r" 등
telloGenerator.forBlock['tello_flip'] = function(block) {
  const direction = block.getFieldValue('DIRECTION');
  return 'flip ' + direction + '\n';
};

// ===== 속도 =====

// 속도 설정: "speed 50"
telloGenerator.forBlock['tello_speed'] = function(block) {
  const speed = block.getFieldValue('SPEED');
  return 'speed ' + speed + '\n';
};

// ===== 고급 이동 =====

// 좌표 이동: "go 100 0 50 50"
telloGenerator.forBlock['tello_go'] = function(block) {
  const x = block.getFieldValue('X');
  const y = block.getFieldValue('Y');
  const z = block.getFieldValue('Z');
  const speed = block.getFieldValue('SPEED');
  return 'go ' + x + ' ' + y + ' ' + z + ' ' + speed + '\n';
};

// 곡선 비행: "curve 100 0 0 200 100 0 30"
telloGenerator.forBlock['tello_curve'] = function(block) {
  const x1 = block.getFieldValue('X1');
  const y1 = block.getFieldValue('Y1');
  const z1 = block.getFieldValue('Z1');
  const x2 = block.getFieldValue('X2');
  const y2 = block.getFieldValue('Y2');
  const z2 = block.getFieldValue('Z2');
  const speed = block.getFieldValue('SPEED');
  return 'curve ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + speed + '\n';
};

// ===== 미션패드 =====

// 미션패드 감지 ON: "mon"
telloGenerator.forBlock['tello_mission_on'] = function(block) {
  return 'mon\n';
};

// 미션패드 감지 OFF: "moff"
telloGenerator.forBlock['tello_mission_off'] = function(block) {
  return 'moff\n';
};

// 미션패드 감지 방향: "mdirection 0"
telloGenerator.forBlock['tello_mission_direction'] = function(block) {
  const direction = block.getFieldValue('DIRECTION');
  return 'mdirection ' + direction + '\n';
};

// 미션패드 기준 이동: "go 100 0 50 50 m1"
telloGenerator.forBlock['tello_go_mid'] = function(block) {
  const mid = block.getFieldValue('MID');
  const x = block.getFieldValue('X');
  const y = block.getFieldValue('Y');
  const z = block.getFieldValue('Z');
  const speed = block.getFieldValue('SPEED');
  return 'go ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ' + mid + '\n';
};

// 미션패드 점프: "jump 0 0 50 50 0 m1 m2"
telloGenerator.forBlock['tello_jump'] = function(block) {
  const mid1 = block.getFieldValue('MID1');
  const mid2 = block.getFieldValue('MID2');
  const x = block.getFieldValue('X');
  const y = block.getFieldValue('Y');
  const z = block.getFieldValue('Z');
  const speed = block.getFieldValue('SPEED');
  const yaw = block.getFieldValue('YAW');
  return 'jump ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ' + yaw + ' ' + mid1 + ' ' + mid2 + '\n';
};

// ===== 흐름 제어 =====

// 대기: "wait:3" (서버에서 time.sleep으로 처리)
telloGenerator.forBlock['tello_wait'] = function(block) {
  const seconds = block.getFieldValue('SECONDS');
  return 'wait:' + seconds + '\n';
};

// 반복: 내부 블록을 N번 반복 출력
telloGenerator.forBlock['tello_repeat'] = function(block) {
  const times = block.getFieldValue('TIMES');
  // 반복 내부 블록의 코드를 가져옴
  const innerCode = telloGenerator.statementToCode(block, 'DO');
  // N번 반복하여 명령 리스트에 추가
  let result = '';
  for (let i = 0; i < times; i++) {
    result += innerCode;
  }
  return result;
};

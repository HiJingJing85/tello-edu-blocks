/**
 * Tello EDU 커스텀 Blockly 블록 정의
 * - 테마 블록 스타일 사용 (blockStyle)
 * - 학생 친화적 큰 텍스트와 명확한 아이콘
 */

// ===================================================================
// 1. 기본 제어 블록
// ===================================================================

Blockly.Blocks['tello_takeoff'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('이륙하기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('control_blocks');
    this.setTooltip('드론을 이륙시킵니다.');
  }
};

Blockly.Blocks['tello_land'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('착륙하기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('control_blocks');
    this.setTooltip('드론을 착륙시킵니다.');
  }
};

Blockly.Blocks['tello_emergency'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('긴급 정지!');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('control_blocks');
    this.setTooltip('모터를 즉시 정지합니다. 위험할 때만 사용하세요!');
  }
};

Blockly.Blocks['tello_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('제자리에서 멈추기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('control_blocks');
    this.setTooltip('드론을 현재 위치에서 정지시킵니다.');
  }
};

// ===================================================================
// 2. 이동 블록
// ===================================================================

Blockly.Blocks['tello_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['위로', 'up'],
          ['아래로', 'down'],
          ['왼쪽으로', 'left'],
          ['오른쪽으로', 'right'],
          ['앞으로', 'forward'],
          ['뒤로', 'back']
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldNumber(50, 20, 500, 1), 'DISTANCE')
        .appendField('cm 이동하기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('move_blocks');
    this.setTooltip('지정한 방향으로 거리(20~500cm)만큼 이동합니다.');
  }
};

// ===================================================================
// 3. 회전 블록
// ===================================================================

Blockly.Blocks['tello_rotate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['시계 방향', 'cw'],
          ['반시계 방향', 'ccw']
        ]), 'DIRECTION')
        .appendField('으로')
        .appendField(new Blockly.FieldNumber(90, 1, 360, 1), 'ANGLE')
        .appendField('도 회전하기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('rotate_blocks');
    this.setTooltip('지정한 방향으로 각도(1~360도)만큼 회전합니다.');
  }
};

// ===================================================================
// 4. 플립 블록
// ===================================================================

Blockly.Blocks['tello_flip'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['왼쪽', 'l'],
          ['오른쪽', 'r'],
          ['앞쪽', 'f'],
          ['뒤쪽', 'b']
        ]), 'DIRECTION')
        .appendField('으로 뒤집기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('flip_blocks');
    this.setTooltip('지정한 방향으로 공중 뒤집기를 합니다.');
  }
};

// ===================================================================
// 5. 속도 블록
// ===================================================================

Blockly.Blocks['tello_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('속도를')
        .appendField(new Blockly.FieldNumber(50, 10, 100, 1), 'SPEED')
        .appendField('cm/s 로 설정하기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('speed_blocks');
    this.setTooltip('비행 속도를 설정합니다 (10~100 cm/s).');
  }
};

// ===================================================================
// 6. 고급 이동 블록
// ===================================================================

Blockly.Blocks['tello_go'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('좌표로 이동하기');
    this.appendDummyInput()
        .appendField('  X')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'X')
        .appendField('  Y')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Y')
        .appendField('  Z')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Z');
    this.appendDummyInput()
        .appendField('  속도')
        .appendField(new Blockly.FieldNumber(50, 10, 100, 1), 'SPEED')
        .appendField('cm/s');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('advanced_blocks');
    this.setTooltip('X, Y, Z 좌표로 이동합니다. (범위: -500~500cm)');
  }
};

Blockly.Blocks['tello_curve'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('곡선으로 비행하기');
    this.appendDummyInput()
        .appendField('  경유점  X')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'X1')
        .appendField('Y')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Y1')
        .appendField('Z')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Z1');
    this.appendDummyInput()
        .appendField('  도착점  X')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'X2')
        .appendField('Y')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Y2')
        .appendField('Z')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Z2');
    this.appendDummyInput()
        .appendField('  속도')
        .appendField(new Blockly.FieldNumber(30, 10, 60, 1), 'SPEED')
        .appendField('cm/s');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('advanced_blocks');
    this.setTooltip('경유점을 거쳐 도착점까지 곡선으로 비행합니다.');
  }
};

// ===================================================================
// 7. 미션패드 블록
// ===================================================================

Blockly.Blocks['tello_mission_on'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('미션패드 감지 켜기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('mission_blocks');
    this.setTooltip('미션패드 감지 기능을 활성화합니다.');
  }
};

Blockly.Blocks['tello_mission_off'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('미션패드 감지 끄기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('mission_blocks');
    this.setTooltip('미션패드 감지 기능을 비활성화합니다.');
  }
};

Blockly.Blocks['tello_mission_direction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('미션패드 감지 방향')
        .appendField(new Blockly.FieldDropdown([
          ['아래쪽만', '0'],
          ['앞쪽만', '1'],
          ['아래쪽 + 앞쪽', '2']
        ]), 'DIRECTION');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('mission_blocks');
    this.setTooltip('미션패드 감지 방향을 설정합니다.');
  }
};

Blockly.Blocks['tello_go_mid'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('미션패드 기준 이동하기');
    this.appendDummyInput()
        .appendField('  패드')
        .appendField(new Blockly.FieldDropdown([
          ['m1', 'm1'], ['m2', 'm2'], ['m3', 'm3'], ['m4', 'm4'],
          ['m5', 'm5'], ['m6', 'm6'], ['m7', 'm7'], ['m8', 'm8']
        ]), 'MID');
    this.appendDummyInput()
        .appendField('  X')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'X')
        .appendField('  Y')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Y')
        .appendField('  Z')
        .appendField(new Blockly.FieldNumber(50, -500, 500, 1), 'Z');
    this.appendDummyInput()
        .appendField('  속도')
        .appendField(new Blockly.FieldNumber(50, 10, 100, 1), 'SPEED')
        .appendField('cm/s');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('mission_blocks');
    this.setTooltip('미션패드 기준 좌표로 이동합니다.');
  }
};

Blockly.Blocks['tello_jump'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('미션패드 점프하기');
    this.appendDummyInput()
        .appendField('  출발')
        .appendField(new Blockly.FieldDropdown([
          ['m1', 'm1'], ['m2', 'm2'], ['m3', 'm3'], ['m4', 'm4'],
          ['m5', 'm5'], ['m6', 'm6'], ['m7', 'm7'], ['m8', 'm8']
        ]), 'MID1')
        .appendField(' → 도착')
        .appendField(new Blockly.FieldDropdown([
          ['m2', 'm2'], ['m1', 'm1'], ['m3', 'm3'], ['m4', 'm4'],
          ['m5', 'm5'], ['m6', 'm6'], ['m7', 'm7'], ['m8', 'm8']
        ]), 'MID2');
    this.appendDummyInput()
        .appendField('  X')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'X')
        .appendField('  Y')
        .appendField(new Blockly.FieldNumber(0, -500, 500, 1), 'Y')
        .appendField('  Z')
        .appendField(new Blockly.FieldNumber(50, -500, 500, 1), 'Z');
    this.appendDummyInput()
        .appendField('  속도')
        .appendField(new Blockly.FieldNumber(50, 10, 100, 1), 'SPEED')
        .appendField('cm/s')
        .appendField('  회전')
        .appendField(new Blockly.FieldNumber(0, -360, 360, 1), 'YAW')
        .appendField('도');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('mission_blocks');
    this.setTooltip('출발 미션패드에서 도착 미션패드로 점프 비행합니다.');
  }
};

// ===================================================================
// 8. 흐름 제어 블록
// ===================================================================

Blockly.Blocks['tello_wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(1, 0.1, 30, 0.1), 'SECONDS')
        .appendField('초 기다리기');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('flow_blocks');
    this.setTooltip('지정한 시간(초)만큼 기다립니다.');
  }
};

Blockly.Blocks['tello_repeat'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(2, 1, 100, 1), 'TIMES')
        .appendField('번 반복하기');
    this.appendStatementInput('DO')
        .appendField('실행:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('flow_blocks');
    this.setTooltip('안에 있는 블록을 지정 횟수만큼 반복합니다.');
  }
};

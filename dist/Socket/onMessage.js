"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessage = void 0;
const __1 = require("..");
let temp = {
    isWaitingBefore: false,
    isGraphingBefore: false,
    isCompleteBefore: false
};
function updateTemp(update) {
    if (update == 'waiting') {
        temp.isWaitingBefore = true;
        temp.isGraphingBefore = false;
        temp.isCompleteBefore = false;
    }
    else if (update == 'graphing') {
        temp.isGraphingBefore = true;
        temp.isWaitingBefore = false;
        temp.isCompleteBefore = false;
    }
    else if (update == 'complete') {
        temp.isCompleteBefore = true;
        temp.isWaitingBefore = false;
        temp.isGraphingBefore = false;
    }
}
function onMessage(data, wss, ev, requireNotRepeated = true, needCloseWithCompletedSession = false, interval) {
    let msg = data.toString();
    let id;
    try {
        id = (0, __1.getString)(msg, '"id":"', '"', 0);
    }
    catch (err) {
        id = '';
    }
    if (id == "crash.tick" || id == "double.tick" || id == 'crash.update' || id == 'doubles.update') {
        let obj = msg.slice(2, msg.length);
        let { payload: json } = JSON.parse(obj)[1];
        let type = id.includes('update') ? 'v1' : 'v2';
        let game = id.includes('crash') ? 'crash' : 'doubles';
        ev.emit(id, Object.assign({ type }, json));
        if (json.status == 'graphing' || json.status == "rolling") {
            if ((requireNotRepeated && !temp.isGraphingBefore) || !requireNotRepeated)
                ev.emit('game_graphing', Object.assign({ type,
                    game, isRepeated: temp.isGraphingBefore }, json));
            if (!temp.isGraphingBefore)
                updateTemp('graphing');
        }
        else if (json.status == 'waiting') {
            if ((requireNotRepeated && !temp.isWaitingBefore) || !requireNotRepeated)
                ev.emit('game_waiting', Object.assign({ type,
                    game, isRepeated: temp.isWaitingBefore }, json));
            if (!temp.isWaitingBefore)
                updateTemp('waiting');
        }
        else {
            if ((requireNotRepeated && !temp.isCompleteBefore) || !requireNotRepeated)
                ev.emit('game_complete', Object.assign({ type,
                    game, isRepeated: temp.isCompleteBefore }, json));
            if (!temp.isCompleteBefore)
                updateTemp('complete');
            if (needCloseWithCompletedSession) {
                clearInterval(interval);
                wss.close();
            }
        }
    }
}
exports.onMessage = onMessage;

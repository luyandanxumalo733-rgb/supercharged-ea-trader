"""
SuperCharged EA V1.0 — MT5/MT4 Bridge
=====================================
Run this on your VPS (or PC running MT5 24/7).
It exposes a tiny HTTP API the SuperCharged EA mobile app calls
to place trades on your Headway (or any) MT5 account with TP/SL.

Quick start
-----------
    pip install MetaTrader5 flask flask-cors
    python mt5-bridge.py

Then in the app -> Broker Connection, set:
    Bridge URL = http://YOUR-VPS-IP:8765

Endpoints
---------
    GET  /health           -> {"ok": true, "mt5": bool}
    POST /login            -> {login, password, server}
    POST /order            -> {symbol, side, lot, tp_pips, sl_pips}
    POST /close-all        -> closes every open position
"""

import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None

app = Flask(__name__)
CORS(app)

API_KEY = os.environ.get("BRIDGE_API_KEY", "")  # optional shared secret


def _auth_ok(req):
    if not API_KEY:
        return True
    return req.headers.get("X-Api-Key") == API_KEY


def _pip(symbol: str) -> float:
    info = mt5.symbol_info(symbol)
    if info is None:
        return 0.0001
    # 3 / 5 digit brokers: pip = 10 * point
    return info.point * (10 if info.digits in (3, 5) else 1)


@app.route("/health")
def health():
    return jsonify({"ok": True, "mt5": mt5 is not None and mt5.terminal_info() is not None})


@app.post("/login")
def login():
    if not _auth_ok(request):
        return jsonify({"ok": False, "error": "unauthorized"}), 401
    if mt5 is None:
        return jsonify({"ok": False, "error": "MetaTrader5 not installed"}), 500
    data = request.get_json(force=True)
    if not mt5.initialize():
        return jsonify({"ok": False, "error": f"init failed: {mt5.last_error()}"}), 500
    ok = mt5.login(int(data["login"]), password=data["password"], server=data["server"])
    return jsonify({"ok": bool(ok), "error": None if ok else str(mt5.last_error())})


@app.post("/order")
def order():
    if not _auth_ok(request):
        return jsonify({"ok": False, "error": "unauthorized"}), 401
    if mt5 is None:
        return jsonify({"ok": False, "error": "MetaTrader5 not installed"}), 500
    d = request.get_json(force=True)
    symbol = d["symbol"]
    side = d.get("side", "BUY").upper()
    lot = float(d.get("lot", 0.01))
    tp_pips = float(d.get("tp_pips", 30))
    sl_pips = float(d.get("sl_pips", 20))

    if not mt5.symbol_select(symbol, True):
        return jsonify({"ok": False, "error": f"symbol {symbol} not available"}), 400

    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        return jsonify({"ok": False, "error": "no tick"}), 400

    pip = _pip(symbol)
    if side == "BUY":
        price = tick.ask
        sl = price - sl_pips * pip
        tp = price + tp_pips * pip
        otype = mt5.ORDER_TYPE_BUY
    else:
        price = tick.bid
        sl = price + sl_pips * pip
        tp = price - tp_pips * pip
        otype = mt5.ORDER_TYPE_SELL

    req_ = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": lot,
        "type": otype,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 20,
        "magic": 20260617,
        "comment": "SuperChargedEA",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    r = mt5.order_send(req_)
    ok = r is not None and r.retcode == mt5.TRADE_RETCODE_DONE
    return jsonify({
        "ok": ok,
        "ticket": getattr(r, "order", None),
        "retcode": getattr(r, "retcode", None),
        "price": price, "sl": sl, "tp": tp,
        "error": None if ok else (str(mt5.last_error()) if r is None else r._asdict()),
    })


@app.post("/close-all")
def close_all():
    if not _auth_ok(request):
        return jsonify({"ok": False, "error": "unauthorized"}), 401
    positions = mt5.positions_get() or []
    closed = 0
    for p in positions:
        tick = mt5.symbol_info_tick(p.symbol)
        if not tick:
            continue
        otype = mt5.ORDER_TYPE_SELL if p.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
        price = tick.bid if p.type == mt5.POSITION_TYPE_BUY else tick.ask
        r = mt5.order_send({
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": p.symbol,
            "volume": p.volume,
            "type": otype,
            "position": p.ticket,
            "price": price,
            "deviation": 20,
            "magic": 20260617,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        })
        if r and r.retcode == mt5.TRADE_RETCODE_DONE:
            closed += 1
    return jsonify({"ok": True, "closed": closed, "of": len(positions)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8765"))
    print(f"SuperCharged EA bridge listening on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)

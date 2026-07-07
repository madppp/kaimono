"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "kaimono:keepAwake";

/**
 * Screen Wake Lock API のフック。
 * ON にすると買い物中に画面がオートスリープしなくなる。
 * 設定は localStorage に保存され、次回リストを開いたときも自動で有効化。
 * タブ切り替えなどでOSにロックを解放された場合は、復帰時に自動で再取得する。
 */
export function useWakeLock() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const wantRef = useRef(false);

  const acquire = useCallback(async () => {
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        sentinelRef.current = null;
        if (!wantRef.current) setActive(false);
      });
      setActive(true);
      return true;
    } catch {
      // 省電力モード中などは拒否されることがある
      setActive(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    setSupported(true);

    if (localStorage.getItem(STORAGE_KEY) === "1") {
      wantRef.current = true;
      acquire();
    }

    const onVisibilityChange = () => {
      if (wantRef.current && document.visibilityState === "visible" && !sentinelRef.current) {
        acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wantRef.current = false;
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };
  }, [acquire]);

  /** ON/OFF を切り替え、切り替え後に有効かどうかを返す。
   * 自動復元が拒否されて active でない場合、タップは「ONにする（再取得）」として扱う */
  const toggle = useCallback(async () => {
    if (wantRef.current && active) {
      wantRef.current = false;
      localStorage.setItem(STORAGE_KEY, "0");
      await sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
      setActive(false);
      return false;
    }
    wantRef.current = true;
    const ok = await acquire();
    if (ok) {
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      wantRef.current = false;
    }
    return ok;
  }, [acquire, active]);

  return { supported, active, toggle };
}

'use client'

import { useState, useEffect } from 'react'
import { useUtilityWidgetStore } from '@/lib/stores/utility-widget'
import { Timer, Shuffle, Plus, X } from 'lucide-react'

export function UtilityWidget() {
  const {
    timerSeconds,
    setTimer,
    clearTimer,
    tick,
    pickerNames,
    addPickerName,
    removePickerName,
    pickRandom,
    pickerResult,
    clearPickerResult,
    setPickerNames,
  } = useUtilityWidgetStore()

  const [pickerInput, setPickerInput] = useState('')

  // Timer tick
  useEffect(() => {
    if (timerSeconds <= 0) return
    const interval = setInterval(() => {
      const remaining = tick()
      if (remaining <= 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('NEXO Daily', { body: '타이머가 종료되었습니다.' })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [timerSeconds, tick])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAddName = () => {
    if (pickerInput.trim()) {
      addPickerName(pickerInput)
      setPickerInput('')
    }
  }

  const handlePasteNames = () => {
    const text = prompt('학생 이름을 한 줄에 한 명씩 입력해주세요.')
    if (text) {
      const names = text.split(/\n/).map((n) => n.trim()).filter(Boolean)
      setPickerNames(names)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">수업 유틸리티</h3>

      {/* Timer */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">상담 타이머</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {[10, 30, 50].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => setTimer(min)}
              className="px-4 py-2.5 text-base font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              {min}분
            </button>
          ))}
        </div>
        {timerSeconds > 0 ? (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatTime(timerSeconds)}
            </span>
            <button
              type="button"
              onClick={clearTimer}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              중지
            </button>
          </div>
        ) : null}
      </div>

      {/* Random Picker */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shuffle className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">당첨자 뽑기</span>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={pickerInput}
            onChange={(e) => setPickerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
            placeholder="이름 입력"
            className="flex-1 px-3 py-2 text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c4b4]/50"
          />
          <button
            type="button"
            onClick={handleAddName}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            aria-label="추가"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={handlePasteNames}
          className="w-full mb-2 text-sm text-slate-500 hover:text-slate-700 py-1"
        >
          여러 명 한번에 붙여넣기
        </button>
        {pickerNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {pickerNames.slice(0, 8).map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-slate-100 rounded"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removePickerName(i)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="제거"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {pickerNames.length > 8 && (
              <span className="text-xs text-slate-400">+{pickerNames.length - 8}명</span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            clearPickerResult()
            pickRandom()
          }}
          disabled={pickerNames.length === 0}
          className="w-full py-3 text-base font-semibold rounded-lg bg-[#00c4b4] hover:bg-[#00a396] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          뽑기
        </button>
        {pickerResult && (
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-xs text-amber-700 mb-1">당첨</p>
            <p className="text-xl font-bold text-amber-900">{pickerResult}</p>
          </div>
        )}
      </div>
    </div>
  )
}

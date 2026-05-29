// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StepBar } from '../shared/StepBar'
import { MOCK_CLINIC } from '../mockData'

interface Props {
  step: number
  children: ReactNode
}

export function PatientLayout({ step, children }: Props) {
  return (
    <div className="min-h-dvh bg-[#FAF8F3] flex flex-col pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#E4DDD2] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/demo/oas/admin"
            className="text-xs text-[#8A9BAC] hover:text-[#1B3664] transition-colors"
          >
            管理者ページ →
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-bold text-[#1B3664] oas-heading tracking-wide">
              {MOCK_CLINIC.clinicName}
            </h1>
            <p className="text-xs text-[#8A9BAC]">オンライン予約</p>
          </div>
          <span className="text-xs text-[#8A9BAC] hidden sm:block">{MOCK_CLINIC.phone}</span>
          <span className="sm:hidden w-[4.5rem]" />
        </div>
      </header>

      {/* Step bar */}
      {step < 3 && (
        <div className="bg-white border-b border-[#E4DDD2] px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <StepBar current={step} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#8A9BAC] border-t border-[#E4DDD2] mt-auto">
        © {new Date().getFullYear()} {MOCK_CLINIC.clinicName}
      </footer>
    </div>
  )
}

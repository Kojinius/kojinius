// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm,
  title = '確認', message,
  confirmLabel = 'はい', cancelLabel = 'キャンセル',
  danger, loading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[#4E6073] mb-6">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

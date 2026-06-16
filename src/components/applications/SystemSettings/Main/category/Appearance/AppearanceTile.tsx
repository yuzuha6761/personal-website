import type { AppearanceMode } from '~types'

export interface AppearancePreview {
  id: AppearanceMode
  label: string
}

interface AppearanceTileProps {
  preview: AppearancePreview
  selected: boolean
  onSelect: () => void
}

function AppearanceTile(props: AppearanceTileProps) {
  const { preview, selected, onSelect } = props
  const dark = preview.id === 'dark'
  const auto = preview.id === 'auto'
  const frameBg = dark ? 'var(--system-settings-preview-dark-frame)' : 'var(--system-settings-preview-light-frame)'
  const sidebarBg = dark ? 'var(--system-settings-preview-dark-sidebar)' : 'var(--system-settings-preview-light-sidebar)'
  const contentBg = dark ? 'var(--system-settings-preview-dark-content)' : 'var(--system-settings-preview-light-content)'
  const titleBg = dark ? 'var(--system-settings-preview-dark-title)' : 'var(--system-settings-preview-light-title)'
  const headerBg = dark ? 'var(--system-settings-preview-dark-header)' : 'var(--system-settings-preview-light-header)'
  const primaryLineBg = dark ? 'var(--system-settings-preview-dark-line-primary)' : 'var(--system-settings-preview-light-line-primary)'
  const secondaryLineBg = dark ? 'var(--system-settings-preview-dark-line-secondary)' : 'var(--system-settings-preview-light-line-secondary)'

  return (
    <button
      aria-pressed={selected}
      className="w-[4.18rem] border-0 bg-transparent p-0 cursor-default"
      onClick={onSelect}
      type="button"
    >
      <div
        className={`box-border h-[2.72rem] w-full rounded-[.32rem] border-[.18rem] overflow-hidden shadow-[0_.08rem_.2rem_var(--system-settings-appearance-tile-shadow)] ${
          selected ? 'border-[var(--system-settings-appearance-tile-selected-border)]' : 'border-transparent'
        }`}
        style={{ background: auto ? 'linear-gradient(90deg, var(--system-settings-preview-light-frame) 0 50%, var(--system-settings-preview-dark-frame) 50% 100%)' : frameBg }}
      >
        <div className="h-full w-full p-[.22rem]">
          {auto ? (
            <div className="relative h-full rounded-[.18rem] overflow-hidden bg-[var(--system-settings-preview-dark-frame)]">
              <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden flex bg-[var(--system-settings-preview-light-frame)]">
                <div className="w-[42%] shrink-0 bg-[var(--system-settings-preview-light-sidebar)]">
                  <div className="mt-[.3rem] ml-[.16rem] h-[.28rem] w-[.72rem] rounded-[.08rem] bg-[var(--system-settings-preview-light-title)]" />
                  <div className="mt-[.24rem] ml-[.16rem] h-[.18rem] w-[.58rem] rounded-full bg-[var(--system-settings-preview-muted-light)]" />
                </div>
                <div className="min-w-0 flex-1 bg-[var(--system-settings-preview-light-content)]">
                  <div className="h-[.72rem] px-[.16rem] flex items-center bg-[var(--system-settings-preview-light-header)]">
                    <span className="h-[.18rem] w-[.62rem] rounded-full bg-[var(--system-settings-preview-light-title)]" />
                  </div>
                  <div className="px-[.16rem] pt-[.24rem]">
                    <div className="mb-[.18rem] h-[.18rem] w-[.7rem] rounded-full bg-[var(--system-settings-preview-light-line-primary)]" />
                    <div className="h-[.18rem] w-[.48rem] rounded-full bg-[var(--system-settings-preview-light-line-secondary)]" />
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden flex bg-[var(--system-settings-preview-dark-frame)]">
                <div className="w-[42%] shrink-0 bg-[var(--system-settings-preview-dark-sidebar)]">
                  <div className="mt-[.3rem] ml-[.16rem] h-[.28rem] w-[.72rem] rounded-[.08rem] bg-[var(--system-settings-preview-dark-title)]" />
                  <div className="mt-[.24rem] ml-[.16rem] h-[.18rem] w-[.58rem] rounded-full bg-[var(--system-settings-preview-muted-dark)]" />
                </div>
                <div className="min-w-0 flex-1 bg-[var(--system-settings-preview-dark-content)]">
                  <div className="h-[.72rem] px-[.16rem] flex items-center bg-[var(--system-settings-preview-dark-header)]">
                    <span className="h-[.18rem] w-[.62rem] rounded-full bg-[var(--system-settings-preview-dark-title)]" />
                  </div>
                  <div className="px-[.16rem] pt-[.24rem]">
                    <div className="mb-[.18rem] h-[.18rem] w-[.7rem] rounded-full bg-[var(--system-settings-preview-dark-line-primary)]" />
                    <div className="h-[.18rem] w-[.48rem] rounded-full bg-[var(--system-settings-preview-dark-line-secondary)]" />
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--system-settings-preview-dark-frame)]" />
            </div>
          ) : (
            <div className="h-full rounded-[.18rem] overflow-hidden flex" style={{ background: frameBg }}>
              <div className="w-[34%]" style={{ background: sidebarBg }}>
                <div className="mt-[.3rem] ml-[.18rem] h-[.28rem] w-[.92rem] rounded-[.08rem]" style={{ background: titleBg }} />
                <div className="mt-[.24rem] ml-[.18rem] h-[.18rem] w-[.75rem] rounded-full bg-[var(--system-settings-preview-muted-light)]" />
              </div>
              <div className="min-w-0 flex-1" style={{ background: contentBg }}>
                <div className="h-[.72rem] px-[.22rem] flex items-center gap-[.12rem]" style={{ background: headerBg }}>
                  <span className="h-[.18rem] w-[.72rem] rounded-full" style={{ background: titleBg }} />
                  <span className="h-[.18rem] w-[.46rem] rounded-full bg-[var(--system-settings-preview-muted-light)]" />
                </div>
                <div className="px-[.22rem] pt-[.24rem]">
                  <div className="mb-[.18rem] h-[.18rem] w-[1.42rem] rounded-full" style={{ background: primaryLineBg }} />
                  <div className="h-[.18rem] w-[1.02rem] rounded-full" style={{ background: secondaryLineBg }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`mt-[.28rem] text-center text-[.75rem] leading-none ${selected ? 'font-600 text-[var(--system-settings-appearance-label-selected)]' : 'text-[var(--system-settings-appearance-label)]'}`}>
        {preview.label}
      </div>
    </button>
  )
}

export default AppearanceTile

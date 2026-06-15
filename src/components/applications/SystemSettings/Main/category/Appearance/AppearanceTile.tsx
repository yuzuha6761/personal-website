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
  const frameBg = dark ? '#232426' : '#ececee'
  const sidebarBg = dark ? '#303236' : '#d9d9dc'
  const contentBg = dark ? '#191a1d' : '#ffffff'
  const titleBg = dark ? '#12c7d6' : '#ef5ba1'

  return (
    <button
      aria-pressed={selected}
      className="w-[4.18rem] border-0 bg-transparent p-0 cursor-default"
      onClick={onSelect}
      type="button"
    >
      <div
        className={`box-border h-[2.72rem] w-full rounded-[.32rem] border-[.18rem] overflow-hidden shadow-[0_.08rem_.2rem_#00000026] ${
          selected ? 'border-#ef5ba1' : 'border-transparent'
        }`}
        style={{ background: auto ? 'linear-gradient(90deg, #ececee 0 50%, #232426 50% 100%)' : frameBg }}
      >
        <div className="h-full w-full p-[.22rem]">
          {auto ? (
            <div className="relative h-full rounded-[.18rem] overflow-hidden bg-#232426">
              <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden flex bg-#ececee">
                <div className="w-[42%] shrink-0 bg-#d9d9dc">
                  <div className="mt-[.3rem] ml-[.16rem] h-[.28rem] w-[.72rem] rounded-[.08rem] bg-#ef5ba1" />
                  <div className="mt-[.24rem] ml-[.16rem] h-[.18rem] w-[.58rem] rounded-full bg-white/80" />
                </div>
                <div className="min-w-0 flex-1 bg-white">
                  <div className="h-[.72rem] px-[.16rem] flex items-center" style={{ background: '#e9e9eb' }}>
                    <span className="h-[.18rem] w-[.62rem] rounded-full bg-#ef5ba1" />
                  </div>
                  <div className="px-[.16rem] pt-[.24rem]">
                    <div className="mb-[.18rem] h-[.18rem] w-[.7rem] rounded-full bg-#cacacd" />
                    <div className="h-[.18rem] w-[.48rem] rounded-full bg-#d8d8db" />
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden flex bg-#232426">
                <div className="w-[42%] shrink-0 bg-#303236">
                  <div className="mt-[.3rem] ml-[.16rem] h-[.28rem] w-[.72rem] rounded-[.08rem] bg-#12c7d6" />
                  <div className="mt-[.24rem] ml-[.16rem] h-[.18rem] w-[.58rem] rounded-full bg-white/28" />
                </div>
                <div className="min-w-0 flex-1 bg-#191a1d">
                  <div className="h-[.72rem] px-[.16rem] flex items-center bg-#2b2d31">
                    <span className="h-[.18rem] w-[.62rem] rounded-full bg-#12c7d6" />
                  </div>
                  <div className="px-[.16rem] pt-[.24rem]">
                    <div className="mb-[.18rem] h-[.18rem] w-[.7rem] rounded-full bg-#56585d" />
                    <div className="h-[.18rem] w-[.48rem] rounded-full bg-#45474c" />
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-#232426" />
            </div>
          ) : (
            <div className="h-full rounded-[.18rem] overflow-hidden flex" style={{ background: frameBg }}>
              <div className="w-[34%]" style={{ background: sidebarBg }}>
                <div className="mt-[.3rem] ml-[.18rem] h-[.28rem] w-[.92rem] rounded-[.08rem]" style={{ background: titleBg }} />
                <div className="mt-[.24rem] ml-[.18rem] h-[.18rem] w-[.75rem] rounded-full bg-#ffffff80" />
              </div>
              <div className="min-w-0 flex-1" style={{ background: contentBg }}>
                <div className="h-[.72rem] px-[.22rem] flex items-center gap-[.12rem]" style={{ background: dark ? '#2b2d31' : '#e9e9eb' }}>
                  <span className="h-[.18rem] w-[.72rem] rounded-full" style={{ background: titleBg }} />
                  <span className="h-[.18rem] w-[.46rem] rounded-full bg-#ffffff80" />
                </div>
                <div className="px-[.22rem] pt-[.24rem]">
                  <div className="mb-[.18rem] h-[.18rem] w-[1.42rem] rounded-full" style={{ background: dark ? '#56585d' : '#cacacd' }} />
                  <div className="h-[.18rem] w-[1.02rem] rounded-full" style={{ background: dark ? '#45474c' : '#d8d8db' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`mt-[.28rem] text-center text-[.75rem] leading-none ${selected ? 'font-600 text-#1f1f1f' : 'text-#555555'}`}>
        {preview.label}
      </div>
    </button>
  )
}

export default AppearanceTile

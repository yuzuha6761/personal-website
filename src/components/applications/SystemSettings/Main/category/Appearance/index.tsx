import { Radio, Select, Switch } from '~/components/ui-kit'
import { dragExcludeProps } from '~/components/Window/Drag'
import useSystemSettingsStore from '~/stores/settings/system-settings'
import {
  ACCENT_COLOR_OPTIONS,
  HIGHLIGHT_COLOR_OPTIONS,
  SIDEBAR_ICON_SIZE_OPTIONS,
} from '~/stores/settings/system-settings.constants'
import type { HighlightColorId, SidebarIconSize } from '~types'
import SettingsRow from '../../shared/SettingsRow'
import AppearanceTile, { type AppearancePreview } from './AppearanceTile'

const appearancePreviews: AppearancePreview[] = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
  { id: 'auto', label: '自动' },
]

function Appearance() {
  const appearance = useSystemSettingsStore((state) => state.appearance)
  const color = useSystemSettingsStore((state) => state.color)
  const textHighlightColor = useSystemSettingsStore((state) => state.textHighlightColor)
  const sidebarIconSize = useSystemSettingsStore((state) => state.sidebarIconSize)
  const wallpaperTint = useSystemSettingsStore((state) => state.wallpaperTint)
  const scrollBars = useSystemSettingsStore((state) => state.scrollBars)
  const scrollbarClick = useSystemSettingsStore((state) => state.scrollbarClick)
  const setAppearance = useSystemSettingsStore((state) => state.setAppearance)
  const setColor = useSystemSettingsStore((state) => state.setColor)
  const setTextHighlightColor = useSystemSettingsStore((state) => state.setTextHighlightColor)
  const setSidebarIconSize = useSystemSettingsStore((state) => state.setSidebarIconSize)
  const setWallpaperTint = useSystemSettingsStore((state) => state.setWallpaperTint)
  const setScrollBars = useSystemSettingsStore((state) => state.setScrollBars)
  const setScrollbarClick = useSystemSettingsStore((state) => state.setScrollbarClick)
  const selectedAccent = ACCENT_COLOR_OPTIONS.find((option) => option.id === color) ?? ACCENT_COLOR_OPTIONS[3]

  return (
    <div className="max-w-[28.7rem]">
      <section className="mb-[.7rem] rounded-[.34rem] border border-#dddddd bg-#f7f7f7">
        <div className="px-[.7rem] py-[.55rem] flex items-start justify-between gap-[1.1rem]">
          <div className="pt-[.12rem] text-[.86rem] leading-none text-#1f1f1f">外观</div>
          <div className="flex gap-[.88rem]">
            {appearancePreviews.map((preview) => (
              <AppearanceTile
                key={preview.id}
                preview={preview}
                selected={preview.id === appearance}
                onSelect={() => setAppearance(preview.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-[.7rem] rounded-[.34rem] border border-#dddddd bg-#f7f7f7 divide-y divide-#dddddd">
        <SettingsRow label="强调色" className="min-h-[3.45rem] items-start">
          <div className="flex flex-col items-end pt-[.12rem]">
            <div className="flex items-center gap-[.54rem]">
              {ACCENT_COLOR_OPTIONS.map((colorOption) => (
                <button
                  aria-label={colorOption.label}
                  aria-pressed={color === colorOption.id}
                  className={`h-[.94rem] w-[.94rem] rounded-full border p-0 cursor-default ${
                    color === colorOption.id ? 'border-#ffffff shadow-[0_0_0_1px_#9a9a9a]' : 'border-#0000001c'
                  }`}
                  key={colorOption.id}
                  onClick={() => setColor(colorOption.id)}
                  style={{ background: colorOption.value }}
                  type="button"
                />
              ))}
            </div>
            <div className="mt-[.34rem] mr-[6.02rem] text-[.72rem] leading-none text-#777777">
              {selectedAccent.label}
            </div>
          </div>
        </SettingsRow>

        <SettingsRow label="高亮标记颜色">
          <div className="w-[4.8rem]" {...dragExcludeProps}>
            <Select
              onChange={(value) => setTextHighlightColor(value as HighlightColorId)}
              options={HIGHLIGHT_COLOR_OPTIONS.map((option) => ({
                value: option.id,
                label: option.label,
                icon: <span className={option.swatchClassName} />,
              }))}
              value={textHighlightColor}
            />
          </div>
        </SettingsRow>

        <SettingsRow label="边栏图标大小">
          <div className="w-[3.05rem]" {...dragExcludeProps}>
            <Select
              onChange={(value) => setSidebarIconSize(value as SidebarIconSize)}
              options={SIDEBAR_ICON_SIZE_OPTIONS}
              value={sidebarIconSize}
            />
          </div>
        </SettingsRow>

        <SettingsRow label="允许基于墙纸调整窗口色调">
          <span {...dragExcludeProps}>
            <Switch
              ariaLabel="允许基于墙纸调整窗口色调"
              checked={wallpaperTint}
              onChange={setWallpaperTint}
            />
          </span>
        </SettingsRow>
      </section>

      <section className="rounded-[.34rem] border border-#dddddd bg-#f7f7f7 divide-y divide-#dddddd">
        <div className="px-[.7rem] py-[.55rem]">
          <div className="mb-[.36rem] text-[.86rem] leading-none text-#1f1f1f">显示滚动条</div>
          <div className="flex flex-col gap-[.32rem]" {...dragExcludeProps} role="radiogroup" aria-label="显示滚动条">
            <Radio
              checked={scrollBars === 'automatic'}
              label="根据鼠标或触控板自动显示"
              name="scroll-bars"
              onChange={() => setScrollBars('automatic')}
            />
            <Radio
              checked={scrollBars === 'scrolling'}
              label="滚动时"
              name="scroll-bars"
              onChange={() => setScrollBars('scrolling')}
            />
            <Radio
              checked={scrollBars === 'always'}
              label="始终"
              name="scroll-bars"
              onChange={() => setScrollBars('always')}
            />
          </div>
        </div>

        <div className="px-[.7rem] py-[.55rem]">
          <div className="mb-[.36rem] text-[.86rem] leading-none text-#1f1f1f">在滚动条中点按</div>
          <div className="flex flex-col gap-[.32rem]" {...dragExcludeProps} role="radiogroup" aria-label="在滚动条中点按">
            <Radio
              checked={scrollbarClick === 'next-page'}
              label="跳至下一页"
              name="scrollbar-click"
              onChange={() => setScrollbarClick('next-page')}
            />
            <Radio
              checked={scrollbarClick === 'clicked-spot'}
              label="跳到点按的位置"
              name="scrollbar-click"
              onChange={() => setScrollbarClick('clicked-spot')}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Appearance

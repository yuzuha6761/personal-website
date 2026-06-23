import type { ReactNode } from 'react'
import { Checkbox, Select, Slider, Switch } from '~/components/ui-kit'
import { dragExcludeProps } from '~/components/Window/Drag'
import useSystemSettingsStore from '~/stores/settings/system-settings'
import {
  DEFAULT_WEB_BROWSER_OPTIONS,
  DOCK_POSITION_OPTIONS,
  DOCUMENT_TABS_PREFERENCE_OPTIONS,
  DOUBLE_CLICK_TITLE_BAR_ACTION_OPTIONS,
  STAGE_MANAGER_WINDOW_DISPLAY_OPTIONS,
  WALLPAPER_CLICK_ACTION_OPTIONS,
  WIDGET_STYLE_OPTIONS,
  WINDOW_MINIMIZE_EFFECT_OPTIONS,
} from '~/stores/settings/system-settings.constants'
import type {
  DockPosition,
  DocumentTabsPreference,
  DoubleClickTitleBarAction,
  StageManagerWindowDisplay,
  WallpaperClickAction,
  WidgetStyle,
  WindowMinimizeEffect,
} from '~types'
import SettingsRow from '~/components/applications/SystemSettings/Main/shared/SettingsRow'

const sectionClass = 'mb-[.7rem] rounded-[.34rem] border border-[var(--system-surface-border)] bg-[var(--system-surface-elevated)] divide-y divide-[var(--system-surface-border)]'
const labelTextClass = 'text-[.86rem] leading-[1.16rem] text-[var(--system-settings-row-label)]'
const descriptionTextClass = 'mt-[.14rem] text-[.72rem] leading-[.96rem] text-[var(--system-text-muted)]'

interface RowLabelProps {
  title: ReactNode
  description?: ReactNode
}

function RowLabel(props: RowLabelProps) {
  const { title, description } = props

  return (
    <div>
      <div className={labelTextClass}>{title}</div>
      {description ? <div className={descriptionTextClass}>{description}</div> : null}
    </div>
  )
}

interface SectionTitleProps {
  title: string
  description?: ReactNode
}

function SectionTitle(props: SectionTitleProps) {
  const { title, description } = props

  return (
    <div className="mb-[.45rem] px-[.7rem] pt-[.68rem]">
      <h2 className="m-0 text-[.88rem] font-700 leading-none text-[var(--system-settings-row-label)]">{title}</h2>
      {description ? <p className="m-0 mt-[.24rem] text-[.72rem] leading-[.96rem] text-[var(--system-text-muted)]">{description}</p> : null}
    </div>
  )
}

interface SelectControlProps {
  value: string
  options: { value: string, label: string, icon?: ReactNode }[]
  width?: string
  onChange: (value: string) => void
}

function SelectControl(props: SelectControlProps) {
  const { value, options, width = 'w-[5.15rem]', onChange } = props

  return (
    <div className={width} {...dragExcludeProps}>
      <Select options={options} value={value} onChange={onChange} />
    </div>
  )
}

interface SwitchControlProps {
  ariaLabel: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SwitchControl(props: SwitchControlProps) {
  const { ariaLabel, checked, onChange } = props

  return (
    <span {...dragExcludeProps}>
      <Switch ariaLabel={ariaLabel} checked={checked} onChange={onChange} />
    </span>
  )
}

function BrowserIcon() {
  return (
    <span className="relative h-[.92rem] w-[.92rem] shrink-0 rounded-full bg-[conic-gradient(#e94235_0_25%,#fbbc05_0_50%,#34a853_0_75%,#4285f4_0_100%)]">
      <span className="absolute left-1/2 top-1/2 h-[.42rem] w-[.42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-#4285f4" />
    </span>
  )
}

function DesktopAndDock() {
  const settings = useSystemSettingsStore()

  return (
    <div className="max-w-[28.7rem]">
      <div className="mb-[.42rem] px-[.7rem] text-[.88rem] font-700 leading-none text-[var(--system-settings-row-label)]">程序坞</div>

      <section className="mb-[.7rem] rounded-[.34rem] border border-[var(--system-surface-border)] bg-[var(--system-surface-elevated)]">
        <div className="grid grid-cols-2 gap-[1.6rem] px-[.7rem] py-[.55rem]">
          <div {...dragExcludeProps}>
            <div className="mb-[.32rem] text-[.86rem] font-600 leading-none text-[var(--system-settings-row-label)]">大小</div>
            <Slider
              ariaLabel="程序坞大小"
              max={100}
              min={0}
              onChange={settings.setDockSize}
              value={settings.dockSize}
            />
            <div className="mt-[.12rem] flex justify-between text-[.72rem] leading-none text-[var(--system-settings-row-label)]">
              <span>小</span>
              <span>大</span>
            </div>
          </div>
          <div {...dragExcludeProps}>
            <div className="mb-[.32rem] text-[.86rem] font-600 leading-none text-[var(--system-settings-row-label)]">放大</div>
            <Slider
              ariaLabel="程序坞放大"
              max={100}
              min={0}
              onChange={settings.setDockMagnification}
              value={settings.dockMagnification}
            />
            <div className="mt-[.12rem] flex justify-between text-[.72rem] leading-none text-[var(--system-settings-row-label)]">
              <span>关闭</span>
              <span>小</span>
              <span>大</span>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SettingsRow label="置于屏幕上的位置">
          <SelectControl
            onChange={(value) => settings.setDockPosition(value as DockPosition)}
            options={DOCK_POSITION_OPTIONS}
            value={settings.dockPosition}
            width="w-[4.15rem]"
          />
        </SettingsRow>
        <SettingsRow label="最小化窗口时使用">
          <SelectControl
            onChange={(value) => settings.setMinimizeEffect(value as WindowMinimizeEffect)}
            options={WINDOW_MINIMIZE_EFFECT_OPTIONS}
            value={settings.minimizeEffect}
            width="w-[5.2rem]"
          />
        </SettingsRow>
        <SettingsRow label="连按窗口标题栏以">
          <SelectControl
            onChange={(value) => settings.setDoubleClickTitleBarAction(value as DoubleClickTitleBarAction)}
            options={DOUBLE_CLICK_TITLE_BAR_ACTION_OPTIONS}
            value={settings.doubleClickTitleBarAction}
            width="w-[4.35rem]"
          />
        </SettingsRow>
        <SettingsRow label="将窗口最小化至应用程序图标">
          <SwitchControl
            ariaLabel="将窗口最小化至应用程序图标"
            checked={settings.minimizeWindowsIntoApplicationIcon}
            onChange={settings.setMinimizeWindowsIntoApplicationIcon}
          />
        </SettingsRow>
      </section>

      <section className={sectionClass}>
        <SettingsRow label="自动隐藏和显示程序坞">
          <SwitchControl ariaLabel="自动隐藏和显示程序坞" checked={settings.autoHideDock} onChange={settings.setAutoHideDock} />
        </SettingsRow>
        <SettingsRow label="弹跳打开应用程序">
          <SwitchControl ariaLabel="弹跳打开应用程序" checked={settings.animateOpeningApplications} onChange={settings.setAnimateOpeningApplications} />
        </SettingsRow>
        <SettingsRow label="为打开的应用程序显示指示灯">
          <SwitchControl
            ariaLabel="为打开的应用程序显示指示灯"
            checked={settings.showIndicatorsForOpenApplications}
            onChange={settings.setShowIndicatorsForOpenApplications}
          />
        </SettingsRow>
        <SettingsRow label="在程序坞中显示建议 App 和最近使用的 App">
          <SwitchControl
            ariaLabel="在程序坞中显示建议 App 和最近使用的 App"
            checked={settings.showSuggestedAndRecentApplicationsInDock}
            onChange={settings.setShowSuggestedAndRecentApplicationsInDock}
          />
        </SettingsRow>
      </section>

      <div className="mb-[.42rem] px-[.7rem] text-[.88rem] font-700 leading-none text-[var(--system-settings-row-label)]">桌面与台前调度</div>
      <section className={sectionClass}>
        <SettingsRow label="显示项目">
          <div className="flex items-center gap-[.78rem]" {...dragExcludeProps}>
            <Checkbox checked={settings.showDesktopItemsOnDesktop} label="桌面上" onChange={settings.setShowDesktopItemsOnDesktop} />
            <Checkbox checked={settings.showDesktopItemsInStageManager} label="在台前调度中" onChange={settings.setShowDesktopItemsInStageManager} />
          </div>
        </SettingsRow>
        <SettingsRow
          className="items-start"
          label={(
            <RowLabel
              description="点按墙纸将移开所有窗口以允许访问桌面项目和小组件。"
              title="点按墙纸以显示桌面"
            />
          )}
        >
          <SelectControl
            onChange={(value) => settings.setWallpaperClickAction(value as WallpaperClickAction)}
            options={WALLPAPER_CLICK_ACTION_OPTIONS}
            value={settings.wallpaperClickAction}
            width="w-[4.15rem]"
          />
        </SettingsRow>
      </section>

      <section className={sectionClass}>
        <SettingsRow
          className="items-start"
          label={(
            <RowLabel
              description="“台前调度”将你最近使用的窗口整理成单个条状布局，避免杂乱并供你快速取用。"
              title="台前调度"
            />
          )}
        >
          <SwitchControl ariaLabel="台前调度" checked={settings.stageManager} onChange={settings.setStageManager} />
        </SettingsRow>
        <SettingsRow label="在台前调度中显示最近使用的 App">
          <SwitchControl
            ariaLabel="在台前调度中显示最近使用的 App"
            checked={settings.showRecentAppsInStageManager}
            onChange={settings.setShowRecentAppsInStageManager}
          />
        </SettingsRow>
        <SettingsRow label="显示应用程序窗口">
          <SelectControl
            onChange={(value) => settings.setStageManagerWindowDisplay(value as StageManagerWindowDisplay)}
            options={STAGE_MANAGER_WINDOW_DISPLAY_OPTIONS}
            value={settings.stageManagerWindowDisplay}
            width="w-[4.35rem]"
          />
        </SettingsRow>
      </section>

      <div className="mb-[.42rem] px-[.7rem] text-[.88rem] font-700 leading-none text-[var(--system-settings-row-label)]">小组件</div>
      <section className={sectionClass}>
        <SettingsRow label="显示小组件">
          <div className="flex items-center gap-[.78rem]" {...dragExcludeProps}>
            <Checkbox checked={settings.showWidgetsOnDesktop} label="桌面上" onChange={settings.setShowWidgetsOnDesktop} />
            <Checkbox checked={settings.showWidgetsInStageManager} label="在台前调度中" onChange={settings.setShowWidgetsInStageManager} />
          </div>
        </SettingsRow>
        <SettingsRow label="小组件样式">
          <SelectControl
            onChange={(value) => settings.setWidgetStyle(value as WidgetStyle)}
            options={WIDGET_STYLE_OPTIONS}
            value={settings.widgetStyle}
            width="w-[4.15rem]"
          />
        </SettingsRow>
        <SettingsRow label="使用 iPhone 小组件">
          <SwitchControl ariaLabel="使用 iPhone 小组件" checked={settings.useIphoneWidgets} onChange={settings.setUseIphoneWidgets} />
        </SettingsRow>
      </section>

      <section className={sectionClass}>
        <SettingsRow label="默认网页浏览器">
          <SelectControl
            onChange={settings.setDefaultWebBrowser}
            options={DEFAULT_WEB_BROWSER_OPTIONS.map((option) => ({
              ...option,
              icon: option.value === 'google-chrome' ? <BrowserIcon /> : undefined,
            }))}
            value={settings.defaultWebBrowser}
            width="w-[10.3rem]"
          />
        </SettingsRow>
      </section>

      <div className="mb-[.42rem] px-[.7rem] text-[.88rem] font-700 leading-none text-[var(--system-settings-row-label)]">窗口</div>
      <section className={sectionClass}>
        <SettingsRow label="打开文稿时首选标签页">
          <SelectControl
            onChange={(value) => settings.setDocumentTabsPreference(value as DocumentTabsPreference)}
            options={DOCUMENT_TABS_PREFERENCE_OPTIONS}
            value={settings.documentTabsPreference}
            width="w-[5.7rem]"
          />
        </SettingsRow>
        <SettingsRow label="关闭文稿时要求保存更改">
          <SwitchControl
            ariaLabel="关闭文稿时要求保存更改"
            checked={settings.askToKeepChangesWhenClosingDocuments}
            onChange={settings.setAskToKeepChangesWhenClosingDocuments}
          />
        </SettingsRow>
        <SettingsRow
          className="items-start"
          label={(
            <RowLabel
              description="启用后，再次打开应用程序时不会恢复已打开的文稿和窗口。"
              title="退出应用程序时关闭窗口"
            />
          )}
        >
          <SwitchControl
            ariaLabel="退出应用程序时关闭窗口"
            checked={settings.closeWindowsWhenQuittingApplication}
            onChange={settings.setCloseWindowsWhenQuittingApplication}
          />
        </SettingsRow>
      </section>

      <section className={sectionClass}>
        <SettingsRow label="拖移窗口至屏幕边缘实现平铺">
          <SwitchControl
            ariaLabel="拖移窗口至屏幕边缘实现平铺"
            checked={settings.tileWindowsByDraggingToScreenEdges}
            onChange={settings.setTileWindowsByDraggingToScreenEdges}
          />
        </SettingsRow>
        <SettingsRow label="拖移窗口至菜单栏以充满屏幕">
          <SwitchControl
            ariaLabel="拖移窗口至菜单栏以充满屏幕"
            checked={settings.tileWindowsByDraggingToMenuBar}
            onChange={settings.setTileWindowsByDraggingToMenuBar}
          />
        </SettingsRow>
        <SettingsRow label="拖移窗口时按住 Option 键实现平铺">
          <SwitchControl
            ariaLabel="拖移窗口时按住 Option 键实现平铺"
            checked={settings.tileWindowsByHoldingOption}
            onChange={settings.setTileWindowsByHoldingOption}
          />
        </SettingsRow>
        <SettingsRow label="平铺窗口边缘空白">
          <SwitchControl
            ariaLabel="平铺窗口边缘空白"
            checked={settings.tiledWindowsHaveMargins}
            onChange={settings.setTiledWindowsHaveMargins}
          />
        </SettingsRow>
      </section>

      <SectionTitle
        description="调度中心集中显示打开的窗口以及全屏幕应用程序的缩略图。所有项目在同一视图中，一目了然。"
        title="调度中心"
      />
      <section className="rounded-[.34rem] border border-[var(--system-surface-border)] bg-[var(--system-surface-elevated)] divide-y divide-[var(--system-surface-border)]">
        <SettingsRow label="根据最近使用情况自动重新排列空间">
          <SwitchControl
            ariaLabel="根据最近使用情况自动重新排列空间"
            checked={settings.automaticallyRearrangeSpaces}
            onChange={settings.setAutomaticallyRearrangeSpaces}
          />
        </SettingsRow>
        <SettingsRow label="切换到某个应用程序时，会切换到包含该应用程序的打开窗口的空间">
          <SwitchControl
            ariaLabel="切换到某个应用程序时，会切换到包含该应用程序的打开窗口的空间"
            checked={settings.switchToSpaceWithOpenWindows}
            onChange={settings.setSwitchToSpaceWithOpenWindows}
          />
        </SettingsRow>
        <SettingsRow label="使窗口按应用程序成组">
          <SwitchControl
            ariaLabel="使窗口按应用程序成组"
            checked={settings.groupWindowsByApplication}
            onChange={settings.setGroupWindowsByApplication}
          />
        </SettingsRow>
        <SettingsRow label="显示器具有单独空间">
          <SwitchControl
            ariaLabel="显示器具有单独空间"
            checked={settings.displaysHaveSeparateSpaces}
            onChange={settings.setDisplaysHaveSeparateSpaces}
          />
        </SettingsRow>
        <SettingsRow label="拖移窗口至屏幕顶部进入调度中心">
          <SwitchControl
            ariaLabel="拖移窗口至屏幕顶部进入调度中心"
            checked={settings.dragWindowsToTopForMissionControl}
            onChange={settings.setDragWindowsToTopForMissionControl}
          />
        </SettingsRow>
      </section>
    </div>
  )
}

export default DesktopAndDock

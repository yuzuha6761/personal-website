import { AppIcon } from '../../../icons/AppIcon'
import { seekerIcons } from '../icons'
import { Checkbox } from '../../../ui-kit'
import useSeekerGlobalStore from '../store'

function SidebarTab() {
  const sections = useSeekerGlobalStore((state) => state.sidebarSections)
  const setSidebarItemChecked = useSeekerGlobalStore((state) => state.setSidebarItemChecked)

  return (
    <div className="px-[1.35rem] py-[1rem] text-[.84rem] text-[var(--settings-scene-text,#2f2f2f)]">
      <div className="mb-[.55rem] font-600">在边栏显示这些项目：</div>

      <div className="rounded-[.42rem] border border-[var(--settings-scene-panel-border,#d5d5d5)] bg-[var(--settings-scene-panel-bg,#f7f7f7)] px-[.72rem] py-[.55rem]">
        {sections.map((section) => (
          <section className="mb-[.55rem] last:mb-0" key={section.id}>
            <div className="mb-[.25rem] text-[.76rem] font-700 text-[var(--settings-scene-muted-text,#8a8a8a)]">{section.title}</div>
            {section.items.map((item) => (
              <div className="h-[1.72rem] flex items-center gap-[.45rem]" key={item.id}>
                <Checkbox
                  checked={item.checked}
                  indeterminate={item.indeterminate}
                  onChange={(checked) => setSidebarItemChecked(section.id, item.id, checked)}
                />
                <AppIcon className="w-[.95rem] h-[.95rem] text-[var(--settings-scene-icon,#8f8f8f)]" icon={seekerIcons[item.icon]} strokeWidth={1.75} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export default SidebarTab

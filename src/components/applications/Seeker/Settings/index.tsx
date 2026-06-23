import { PanelLeft, Settings, Settings2, Tag } from 'lucide-react'
import { SettingsScene } from '~/components/ui-kit'
import AdvancedTab from './AdvancedTab'
import GeneralTab from './GeneralTab'
import SidebarTab from './SidebarTab'
import TagsTab from './TagsTab'

function SeekerSettings() {
  return (
    <SettingsScene
      title="Seeker 设置"
      tabs={[
        { id: 'general', label: '通用', icon: Settings, content: <GeneralTab /> },
        { id: 'tags', label: '标签', icon: Tag, content: <TagsTab /> },
        { id: 'sidebar', label: '边栏', icon: PanelLeft, content: <SidebarTab /> },
        { id: 'advanced', label: '高级', icon: Settings2, content: <AdvancedTab /> },
      ]}
    />
  )
}

export default SeekerSettings

import type { AppId, Application } from "~types";
import finderIcon from '~assets/application-icon/finder.png'
import launchpadIcon from '~assets/application-icon/launchpad.png'
import systemSettingsIcon from '~assets/application-icon/system-settings.png'

export const applicationList: Application[] = [
  {
    id: 'finder',
    name: 'Finder',
    defaultSizeX: 960,
    defaultSizeY: 620,
    icon: finderIcon
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    icon: launchpadIcon,
    singleInstance: true,
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    defaultSizeX: 400,
    defaultSizeY: 300,
    icon: systemSettingsIcon,
    singleInstance: true,
  }
]

export const getApplicationById = (id: AppId): Application | undefined => {
  return applicationList.find((application) => application.id === id)
}

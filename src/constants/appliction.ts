import {Application} from "~types";
import finderIcon from '~assets/application-icon/finder.png'
import launchpadIcon from '~assets/application-icon/launchpad.png'
import systemSettingsIcon from '~assets/application-icon/system-settings.png'

export const applicationList: Application[] = [
  {
    id: 'finder',
    name: 'Finder',
    defaultSizeX: 400,
    defaultSizeY: 300,
    icon: finderIcon
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    icon: launchpadIcon
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    defaultSizeX: 400,
    defaultSizeY: 300,
    icon: systemSettingsIcon
  }
]
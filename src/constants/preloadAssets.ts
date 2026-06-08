import { applicationList } from './appliction'
import appleLogo from '~assets/logo/apple.svg'
import trashIcon from '~assets/application-icon/trash.png'
import wallpaper from '~assets/wallpaper/sonoma-light.jpg'

export { wallpaper }

export const startupPreloadImages = [
  wallpaper,
  appleLogo,
  trashIcon,
  ...applicationList.map((application) => application.icon),
]

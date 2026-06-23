import { applicationList } from '~/components/applications/registry'
import appleLogo from '~assets/logo/apple.svg'
import trashIcon from '~assets/application-icon/trash.png'
import wallpaper from '~assets/wallpaper/gradient-wallpapers-lMq3sfMMViM-unsplash.jpg'

export { wallpaper }

export const startupPreloadImages = [
  wallpaper,
  appleLogo,
  trashIcon,
  ...applicationList.map((application) => application.icon),
]

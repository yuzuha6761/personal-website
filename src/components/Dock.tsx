import styles from './Dock.module.scss'
import useDockSettingStore from "../stores/settings/dock";
import {DockPositionEnum} from "~enums";
import trashIcon from '~assets/application-icon/trash.png'
import { getApplicationById } from "../components/applications/registry";
import useWindowStore from "../stores/window";

function Dock() {
  const size = useDockSettingStore((state) => state.size)
  const position = useDockSettingStore((state) => state.position)
  const pinnedApplicationIds = useDockSettingStore((state) => state.pinnedApplicationIds)
  const openApp = useWindowStore((state) => state.openApp)

  useEffect(() => {

  }, [])

  const dockStyle = useMemo(() => {
    if (position === DockPositionEnum.LEFT) return {width: size, height: 'auto'}
    else if (position === DockPositionEnum.BOTTOM) return {width: 'auto', height: size}
    else if (position === DockPositionEnum.RIGHT) return {width: size, height: 'auto'}
  }, [size, position])

  return (
    <div data-position={position} className={styles['dock']} style={dockStyle}>
      {pinnedApplicationIds.map((applicationId) => {
        const application = getApplicationById(applicationId)

        if (!application) return

        return (
          <div key={application.id} onClick={() => openApp(application.id)}>
            <div>{application.name}</div>
            <img src={application.icon} alt=""/>
          </div>
        )
      })}
      <div data-spliter={true}></div>
      <div>
        <div>Trash</div>
        <img src={trashIcon} alt=""/>
      </div>
    </div>
  )
}

export default Dock

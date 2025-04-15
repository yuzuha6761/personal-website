import styles from './MenuBar.module.scss'
import appleLogo from '~assets/logo/apple.svg'
import useGlobalStore from "../stores/global";
import { DateTime } from 'luxon'

function MenuBar() {
  const [activeMenuId, setActiveMenuId] = useState('')
  const [mouseDownTimestamp, setMouseDownTimestamp] = useState(0)
  const timestamp = useGlobalStore((state) => state.timestamp)

  const dockRef = useRef<HTMLDivElement>(null)

  useClickAway(() => setActiveMenuId(''), dockRef)

  const onMouseDown = (menuId: string) => {
    setActiveMenuId(menuId)
    setMouseDownTimestamp(Date.now())
  }

  const onMouseEnter = (menuId: string) => {
    if (activeMenuId && activeMenuId !== menuId) setActiveMenuId(menuId)
  }

  const onMouseUp = () => {
    if (Date.now() - mouseDownTimestamp > 1000) setActiveMenuId('')
  }

  return (
    <div className={styles['menu-bar']} ref={dockRef}>
      <div>
        <div
          data-active={activeMenuId === 'logo'}
          onMouseDown={() => onMouseDown('logo')}
          onMouseEnter={() => onMouseEnter('logo')}
          onMouseUp={() => onMouseUp()}
        >
          <div>
            <img src={appleLogo} alt=""/>
          </div>
        </div>
        <div
          data-active={activeMenuId === '0'}
          onMouseDown={() => onMouseDown('0')}
          onMouseEnter={() => onMouseEnter('0')}
          onMouseUp={() => onMouseUp()}
        >
          <div>Finder</div>
        </div>
      </div>
      <div>
        <div
          data-active={activeMenuId === 'date'}
          onMouseDown={() => onMouseDown('date')}
          onMouseUp={() => onMouseUp()}
        >
          <div>
            <span style={{marginRight: '0.6rem'}}>{DateTime.fromMillis(timestamp).toFormat('ccc LLL d')}</span>
            <span>{DateTime.fromMillis(timestamp).toFormat('H:mm')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuBar

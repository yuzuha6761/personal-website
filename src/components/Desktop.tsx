import { useEffect } from 'react'
import styles from './Desktop.module.scss'
import MenuBar from "./MenuBar.tsx";

function Desktop() {
  useEffect(() => {

  }, [])

  return (
    <div className={styles['desktop']}>
      <MenuBar />
    </div>
  )
}

export default Desktop

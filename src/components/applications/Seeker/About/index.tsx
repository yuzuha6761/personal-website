import seekerIcon from '../icon.svg'
import packageJson from '../../../../../package.json'

function SeekerAbout() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-#f5f5f5 px-6 py-8 text-center text-#1f2933">
      <img
        alt=""
        className="w-[5.5rem] h-[5.5rem] rounded-[1.1rem] shadow-[0_.15rem_.6rem_#0000001f]"
        src={seekerIcon}
      />
      <div className="mt-5 text-[1.35rem] font-700">Seeker</div>
      <div className="mt-1 text-[.95rem] text-#4b5563">Macintosh 桌面体验</div>
      <div className="mt-4 text-[.9rem] text-#4b5563">
        {`“Seeker” 版本 ${packageJson.version}`}
      </div>
      <div className="mt-auto pt-8 text-[.72rem] leading-[1.35rem] text-#8a8a8a">
        <div>™和© 2025 yuki</div>
        <div>保留一切权利。</div>
      </div>
    </div>
  )
}

export default SeekerAbout

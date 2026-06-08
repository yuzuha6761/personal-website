import arrowDownCircleIcon from '~assets/sf-symbols/arrow.down.circle.svg'
import chevronDownIcon from '~assets/sf-symbols/chevron.down.svg'
import chevronLeftIcon from '~assets/sf-symbols/chevron.left.svg'
import chevronRightIcon from '~assets/sf-symbols/chevron.right.svg'
import clockIcon from '~assets/sf-symbols/clock.svg'
import documentIcon from '~assets/sf-symbols/document.svg'
import ellipsisCircleIcon from '~assets/sf-symbols/ellipsis.circle.svg'
import filmIcon from '~assets/sf-symbols/film.svg'
import folderBadgePersonIcon from '~assets/sf-symbols/folder.badge.person.crop.svg'
import houseIcon from '~assets/sf-symbols/house.svg'
import icloudIcon from '~assets/sf-symbols/icloud.svg'
import laptopIcon from '~assets/sf-symbols/laptopcomputer.svg'
import listBulletIcon from '~assets/sf-symbols/list.bullet.svg'
import magnifyingGlassIcon from '~assets/sf-symbols/magnifyingglass.svg'
import menuBarDockIcon from '~assets/sf-symbols/menubar.dock.rectangle.svg'
import photoIcon from '~assets/sf-symbols/photo.svg'
import plusIcon from '~assets/sf-symbols/plus.svg'
import rectangleSplitIcon from '~assets/sf-symbols/rectangle.split.3x1.svg'
import shareIcon from '~assets/sf-symbols/square.and.arrow.up.svg'
import squareGridIcon from '~assets/sf-symbols/square.grid.2x2.svg'
import groupGridIcon from '~assets/sf-symbols/square.grid.3x1.below.line.grid.1x2.svg'
import galleryIcon from '~assets/sf-symbols/squares.below.rectangle.svg'
import tagIcon from '~assets/sf-symbols/tag.svg'
import type { FinderItemIcon, FinderSidebarIcon } from './types'

export const sidebarIconMap: Record<FinderSidebarIcon, string> = {
  recents: clockIcon,
  applications: plusIcon,
  movies: filmIcon,
  music: menuBarDockIcon,
  pictures: photoIcon,
  downloads: arrowDownCircleIcon,
  home: houseIcon,
  icloud: icloudIcon,
  document: documentIcon,
  desktop: rectangleSplitIcon,
  shared: folderBadgePersonIcon,
  computer: laptopIcon,
  onedrive: icloudIcon,
}

export const fileIconMap: Record<FinderItemIcon, string> = {
  folder: folderBadgePersonIcon,
  scss: documentIcon,
  tsx: documentIcon,
}

export const finderToolbarIcons = {
  chevronDown: chevronDownIcon,
  chevronLeft: chevronLeftIcon,
  chevronRight: chevronRightIcon,
  columns: rectangleSplitIcon,
  gallery: galleryIcon,
  grid: squareGridIcon,
  group: groupGridIcon,
  list: listBulletIcon,
  more: ellipsisCircleIcon,
  plus: plusIcon,
  search: magnifyingGlassIcon,
  share: shareIcon,
  tag: tagIcon,
}

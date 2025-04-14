import {Application} from "~types";

export class ApplicationWindow {
  application: Application;
  sizeX: number;
  sizeY: number;
  positionX: number;
  positionY: number;
  show: boolean;
  minimized: boolean;

  constructor(application: Application) {
    this.application = application
    this.positionX = 0;
    this.positionY = 0;
    this.sizeX = this.application.defaultSizeX || 400
    this.sizeY = this.application.defaultSizeY || 300
    this.show = true
    this.minimized = false
  }
}

export const launchApplication = (application: Application) => {
  return new ApplicationWindow(application)
}
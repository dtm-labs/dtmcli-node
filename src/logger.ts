export interface Logger {
  log(message?: any, ...optionalParams: any[]): void
  debug(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
}

let logger: Logger = console

export function initLogger(mlogger?: Logger): void {
  if (mlogger) {
    logger = mlogger
  }
}

export function getLogger(): Logger {
  return logger
}

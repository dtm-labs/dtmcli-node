
import { Sequelize } from 'sequelize'
import { initLogger, Logger } from './logger'
import { initModel } from './dao'

export * from './id'
export * from './tcc'
export * from './error'
export * from './common'
export * from './saga'
export * from './msg'
export * from './barrier'

export interface Options {
  sequelize: Sequelize
  barrierTableName?: string
  logger?: Logger
}

export function init(options: Options): void {
  initModel(options.sequelize, options.barrierTableName)
  initLogger(options.logger)
}

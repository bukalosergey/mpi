import { IPinoLogger } from './adapters/pino-adapter';
import * as pino from 'pino';
import { _appSettings } from '../providers/app-settings.provider';

const destination = _appSettings.logger.destination && pino.destination(_appSettings.logger.destination);
const pinoLogger = pino(destination);
pinoLogger.level = _appSettings.logger.level;

export const logger: IPinoLogger = pinoLogger;
export { ILogger } from './logger.interface';

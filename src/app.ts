import { LocalContext, LocalWorkerPlugin } from './index';

export default (plu: LocalWorkerPlugin) => {
  // plu.on('props', configs => plu.logger.debug('nelts props received:', configs));
  // plu.on('ServerStarted', () => plu.logger.debug('nelts life [ServerStarted] invoked.'));
  // plu.on('ServerStopping', () => plu.logger.debug('nelts life [ServerStopping] invoked.'));
  // plu.on('ServerStopped', () => plu.logger.debug('nelts life [ServerStopped] invoked.'));
  // plu.on('ContextStart', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextStart] invoked.'));
  // plu.on('ContextStaticValidator', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextStaticValidator] invoked.'));
  // plu.on('ContextStaticFilter', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextStaticFilter] invoked.'));
  // plu.on('ContextDynamicLoader', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextDynamicLoader] invoked.'));
  // plu.on('ContextDynamicValidator', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextDynamicValidator] invoked.'));
  // plu.on('ContextDynamicFilter', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextDynamicFilter] invoked.'));
  // plu.on('ContextGuard', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextGuard] invoked.'));
  // plu.on('ContextMiddleware', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextMiddleware] invoked.'));
  // plu.on('ContextRuntime', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextRuntime] invoked.'));
  // plu.on('ContextResponse', (ctx: LocalContext) => plu.logger.debug('nelts context life [ContextResponse] invoked.'));
  // plu.on('ContextResolve', (ctx: LocalContext) => plu.logger.debug('nelts context life status [ContextResolve] invoked.'));
  // plu.on('ContextReject', (e: Error, ctx: LocalContext) => plu.logger.debug('nelts context life status [ContextReject] invoked.'));
}
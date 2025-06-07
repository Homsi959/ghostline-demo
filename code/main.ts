import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonService } from './logger/winston.service';

/**
 * Launches the NestJS application.
 *
 * Creates an application with `AppModule`, configures the `WinstonService` logger, and
 * starts the server on port 4000 or the one specified in `process.env.PORT`.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Promise upon successful server startup.
 *
 * @example
 * bootstrap();
 *
 * @throws {Error} If the server fails to start.
 */
async function bootstrap(): Promise<void> {
  const nest = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  nest.useLogger(nest.get(WinstonService));
  const PORT = Number(process.env.PORT) || 4000;
  console.log(
    `\x1b[36m\x1b[1m🚀🚀🚀 Server started at http://localhost:${PORT} 🚀🚀🚀\x1b[0m`,
  );

  await nest.listen(PORT);
}

bootstrap().catch((err: Error) => {
  console.error('Failed to start the server', err.message);
  console.error(err.stack);
});

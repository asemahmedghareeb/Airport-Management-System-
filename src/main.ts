import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT!);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  console.log(`Server started on http://localhost:${process.env.PORT}/graphql`);
}
bootstrap();

// docker-compose => it is a tool that allows you to define and run multi-container Docker applications.

//to run the containers in production mode=>   docker-compose -f docker-compose.yml  -f  docker-compose.prod.yml up -d
//to run the containers in development mode=>  docker-compose -f docker-compose.yml  -f  docker-compose.dev.yml up -d

//to build the container (use it for example when you install new package)=> docker-compose  -f  docker-compose.yml  -f docker-compose.dev.yml  up -d --build

//to stop the containers in development mode=> docker-compose  -f  docker-compose.dev.yml down
//to stop the containers in production mode=> docker-compose  -f  docker-compose.prod.yml down
//for deleting the  container => docker rm  Airport-management-system-container -f

//opening container bash => docker exec -it   Airport-management-system-container bash
//for docker logs => docker logs  Airport-management-system-container -f

//dockerfile => docker image => docker container
  
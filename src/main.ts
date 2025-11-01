import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later.',
      },
    }),
    
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT!);
  console.log(`Server started on http://localhost:${process.env.PORT}/graphql`);
}
bootstrap();

//to run the containers in production mode=>   docker-compose -f docker-compose.yml  -f  docker-compose.prod.yml up -d
//to run the containers in development mode=>  docker-compose -f docker-compose.yml  -f  docker-compose.dev.yml up -d

//to build the container (use it for example when you install new package)=> docker-compose  -f  docker-compose.yml  -f docker-compose.dev.yml  up -d --build

//to stop the containers in development mode=> docker-compose  -f  docker-compose.dev.yml down
//to stop the containers in production mode=> docker-compose  -f  docker-compose.prod.yml down
//for deleting the  container => docker rm  Airport-management-system-container -f

//opening container bash => docker exec -it   Airport-management-system-container bash
//for docker logs => docker logs  Airport-management-system-container -f

//admin token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZDlmYWQ4MS1hZTQ0LTQwODgtYjY2Zi01MTU5NjliMTU2ZjYiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NjE4ODM1NjAsImV4cCI6MTc2MjQ4ODM2MH0.yyhM4tjz8BZXCF3fA3vWur5wl_1JaWgsRWwhqaOd1bg

//staff token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZTFmMjVkMy00MzE0LTRhZTItYWQ4OC1jZmU1MTMzMDAyZTciLCJyb2xlIjoiU3RhZmYiLCJzdGFmZklkIjoiYjE5OGRjOTYtOTU1MC00NzBhLTg0ZjctMmQ0ZTY0MDkyNTllIiwiYWlycG9ydElkIjoiMGQxN2QxN2UtNTU5OS00ZjEzLTkzNmQtOWQ2MjliZGIxOGM0IiwiZmxpZ2h0cyI6WyJjNzcwZDFiMi1iNTIxLTQwOTUtYmIwZC1mMWIzYjBlZjI2NmMiXSwiaWF0IjoxNzYxODkzNzMxLCJleHAiOjE3NjI0OTg1MzF9.nrz-IphVXCptaOqsDz2ygTa499PeB9bNXpr8TXJVjq0

//passenger token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ODU4N2JlZS00YzNkLTRhYTQtODc2My0zMDc2OWJjZjNlNDQiLCJyb2xlIjoiUGFzc2VuZ2VyIiwicGFzc2VuZ2VySWQiOiJmZjVkZTY5MC03NDkyLTQ3NWMtYWI3ZS1lZGVhYWIyZjM3YTUiLCJib29raW5ncyI6WyJkZWNhN2I5NS00ZGQ3LTQ0NGUtOGJlOC1kMTVkYzUwOTI5YWQiXSwiaWF0IjoxNzYxOTEzMDk2LCJleHAiOjE3NjI1MTc4OTZ9.24sp4lrEuIEmvVTM67BbKGcU_JakW6m2BLY7GJGuCio

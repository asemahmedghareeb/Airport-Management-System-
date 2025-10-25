import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT!);
  console.log('Server started on http://localhost:3000/graphql');
  console.log("hi hi hi")
} 
bootstrap();
   
  
//Docker commands
//1-for creating the image using dockerfile =>  docker build  -t express-node-app .

//for creating the  container  from the docker image => docker run  --name express-app-container express-node-app
//for creating the  container in detached mode => docker run  --name express-app-container -d express-node-app (better)

//running the  container and mapping the ports (port forwarding) => docker run  --name express-app-container -d -p 3000:3000  express-node-app

//for container reload  and port forwarding  => docker run  --name express-app-container -v /D:/Development/backend/docker/node-app:/app  -d -p 3000:3000  express-node-app

//2-for container reload  and port forwarding and to make it read only container => docker run  --name express-app-container -v /D:/Development/backend/docker/node-app/src:/app/src:ro  -d -p 3000:3000  express-node-app

//same but for windows
//2-for container reload  and port forwarding and to make it read only container => docker run  --name express-app-container -v %cd%/src:/app/src:ro  -d -p 3000:3000  express-node-app

// docker-compose => it is a tool that allows you to define and run multi-container Docker applications. 

//to run the containers=> docker-compose up -d
//to stop the containers=> docker-compose down

//to run the containers in production mode=>   docker-compose -f docker-compose.yml  -f  docker-compose.prod.yml up -d 
//to run the containers in development mode=>  docker-compose -f docker-compose.yml  -f  docker-compose.dev.yml up -d

//to build the container (use it for example when you install new package)=> docker-compose  -f  docker-compose.yml  -f docker-compose.dev.yml  up -d --build
 
//to stop the containers in development mode=> docker-compose  -f  docker-compose.dev.yml down
//to stop the containers in production mode=> docker-compose  -f  docker-compose.prod.yml down

//to get container info => docker inspect node-app-mongo-1
//opening container bash => docker exec -it   Airport-management-system-container bash
//for docker logs => docker logs  Airport-management-system-container -f
//for deleting the  container =. docker rm  Airport-management-system-container -f

//dockerfile => docker image => docker container
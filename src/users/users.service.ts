import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
private users: User[] = [
{ id: 1, username: 'asem', roles: ['user', 'admin'] },
{ id: 2, username: 'mohamed', roles: ['user'] },
];


findById(id: number) {
return this.users.find((u) => u.id === id);
}
}
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update', 
  Delete = 'delete',
}

class Article {
  id: number;
  authorId: number;
  isPublished: boolean;
}

class User {
  id: number; 
  isAdmin: boolean;
}

type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}


// const user = new User();
// const article = new Article();
// article.authorId = user.id;
// article.isPublished = false;
// user.isAdmin = false;

// const ability = new CaslAbilityFactory().createForUser(user);
// console.log(ability.can(Action.Read, Article)); 
// console.log(ability.can(Action.Update, Article)); 
// console.log(ability.can(Action.Create, Article));
// console.log(ability.can(Action.Delete, Article));
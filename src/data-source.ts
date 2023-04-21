import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Certificate } from "./entity/Certificate";
export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    database: "moss",
    synchronize: true,
    logging: false,
    entities: [User,Certificate],
    migrations: [],
    subscribers: [],
})

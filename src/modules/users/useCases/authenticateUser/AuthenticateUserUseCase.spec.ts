import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AppError } from "../../../../shared/errors/AppError"

let usersRepositoryInMemory: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createUserUseCase: CreateUserUseCase

describe("Authenticate an user", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it("Should be able to authenticate an user", async () => {
        const user: ICreateUserDTO = {
            name: "Fake",
            email: "fakeuser@email.com",
            password: "1234"
        }

        await createUserUseCase.execute(user)

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })

        expect(result).toHaveProperty("token")
    })

    it("Should not be able to authenticate a non-existent user", async () => {
        const user: ICreateUserDTO = {
            name: "Fake",
            email: "fakeuser@email.com",
            password: "1234"
        }

        await createUserUseCase.execute(user)

        await expect(authenticateUserUseCase.execute({
            email: user.email,
            password: "incorrect password"
        })
        ).rejects.toEqual(new AppError("Incorrect email or password", 401))
    })
})
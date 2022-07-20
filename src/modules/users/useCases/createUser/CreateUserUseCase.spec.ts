import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AppError } from "../../../../shared/errors/AppError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Create a new user", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it("Should be able to create a new user", async () => {
        const user = await createUserUseCase.execute ({
            name: "Fake User Name",
            email: "fakeuser@email.com",
            password: "test"
        })

        expect(user).toHaveProperty("id")
    })

    it("Should not be able to create an already existant user", async () => {
        await createUserUseCase.execute ({
            name: "Fake User Name",
            email: "fakeuser@email.com",
            password: "test"
        })

        expect(createUserUseCase.execute({
            name: "Fake User Name",
            email: "fakeuser@email.com",
            password: "test"
        })
        ).rejects.toEqual(new AppError('User already exists'))
    })
})
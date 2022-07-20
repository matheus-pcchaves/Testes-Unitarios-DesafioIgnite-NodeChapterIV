import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileUseCase } from "../showUserProfile/ShowUserProfileUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show user profile", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
    })

    it("Should be able to show user profile by id", async () => {
        const user: ICreateUserDTO = {
            name: "Fake",
            email: "fake@email.com",
            password: "123"
        }

        await createUserUseCase.execute(user)

        const token = await authenticateUserUseCase.execute({
            email: "fake@email.com",
            password: "123"
        })

        const userProfile = await showUserProfileUseCase.execute(token.user.id)

        expect(userProfile).toHaveProperty("id")
    })

    it("Should not be able to show a non-existent user profile", () => {
        expect(async () =>{
            await showUserProfileUseCase.execute("incorrectId")
        }).rejects.toEqual(new AppError('User not found', 404))
    })
})
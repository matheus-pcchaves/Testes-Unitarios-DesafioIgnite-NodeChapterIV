import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { AppError } from "../../../../shared/errors/AppError"
import { CreateStatementError } from "./CreateStatementError"

let usersRepositoryInMemory: InMemoryUsersRepository
let createUsersUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let statementRepositoryInMemory: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase

describe("Create statement", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        statementRepositoryInMemory = new InMemoryStatementsRepository() 
        createUsersUseCase = new CreateUserUseCase(usersRepositoryInMemory)
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
    })

    it("Should be able to create a new deposit statement", async () => {
        const user: ICreateUserDTO = {
            name: "Fake",
            email: "test@email.com",
            password: "123"
        }

        await createUsersUseCase.execute(user)

        const token = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })

        const deposit = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: "Deposit",
        })

        expect(deposit).toHaveProperty("id")
        expect(deposit.amount).toEqual(100)
    })

    it("Should be able to create a new withdraw statement", async () => {
        const user: ICreateUserDTO = {
            name: "Fake",
            email: "test@email.com",
            password: "123"
        }

        await createUsersUseCase.execute(user)

        const token = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })

        const withdraw = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.WITHDRAW,
            amount: 100,
            description: "withdraw",
        })

        expect(withdraw).toHaveProperty("id")
        expect(withdraw.amount).toEqual(100)
    })

    it("Should not be able to create a new statement with insuficient founds", async () => {
        const user = await createUsersUseCase.execute({
            name: "Fake",
            email: "test@email.com",
            password: "123"
        })

        await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 10,
            description: "Deposit",
        })

        expect(async () => {
            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: OperationType.DEPOSIT,
                amount: 100,
                description: "Depositing $100",
            })
        }).rejects.toEqual(new CreateStatementError.InsufficientFunds())
    })

    it("Should not be able to create a statement with a non-existent user", async() => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "unexistent user",
                type: OperationType.DEPOSIT,
                amount: 10,
                description: "Deposit",
            })
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    })
})
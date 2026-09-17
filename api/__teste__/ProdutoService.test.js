const ProdutoService = require("../services/ProdutoService")

describe("ProdutoServices testes unitários", () => {
  let service
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    }

    service = new ProdutoService(mockRepository)
  })

  describe("Listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const produtos = [
        { id: 1, nome: "Coxinha", preco: 5 }
      ]

      mockRepository.findAll.mockReturnValue(produtos)

      const resultado = service.listar()

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1)
      expect(resultado).toEqual(produtos)
    })
  })

  describe("Buscar por ID", () => {
    test("chama repository.findById com o id correto e retorna o produto", () => {
      const produto = {
        id: 1,
        nome: "Coxinha",
        preco: 5
      }

      mockRepository.findById.mockReturnValue(produto)

      const resultado = service.buscarPorId(1)

      expect(mockRepository.findById).toHaveBeenCalledWith(1)
      expect(resultado).toEqual(produto)
    })
  })

  describe("Criar", () => {
    test("repassa os dados para repository.create e retorna o produto criado", () => {
      const dados = {
        nome: "Pizza",
        preco: 30
      }

      const produtoCriado = {
        id: 4,
        nome: "Pizza",
        preco: 30
      }

      mockRepository.create.mockReturnValue(produtoCriado)

      const resultado = service.criar(dados)

      expect(mockRepository.create).toHaveBeenCalledWith(dados)
      expect(resultado).toEqual(produtoCriado)
    })

    test("propaga o erro lançado pelo repository quando os dados forem inválidos", () => {
      const dados = {
        nome: "",
        preco: 30
      }

      mockRepository.create.mockImplementation(() => {
        throw new Error("Dados inválidos")
      })

      expect(() => service.criar(dados)).toThrow("Dados inválidos")
    })
  })

  describe("Remover", () => {
    test("chama repository.delete com o id correto quando o produto existe", () => {
      const produto = {
        id: 1,
        nome: "Coxinha",
        preco: 5
      }

      mockRepository.findById.mockReturnValue(produto)
      mockRepository.delete.mockReturnValue(true)

      expect(() => service.remover(1)).not.toThrow()

      expect(mockRepository.delete).toHaveBeenCalledWith(1)
    })

    test("lança erro 'Produto não encontrado' quando o repository retornar false", () => {
      mockRepository.findById.mockReturnValue({
        id: 1,
        nome: "Coxinha",
        preco: 5
      })

      mockRepository.delete.mockReturnValue(false)

      expect(() => service.remover(1)).toThrow("Produto nao encontrado")
    })
  })
})
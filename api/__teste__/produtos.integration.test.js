const request = require("supertest")
const createApp = require("../app")

describe("API /produtos - testes de integração", () => {
  let app

  beforeEach(() => {
    app = createApp()
  })

  describe("GET /produtos", () => {
    test("Retorna 200 e um array com os produtos iniciais", async () => {
      const res = await request(app).get("/produtos")

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(3)
    })
  })

  //test GET/produtos/:id
  describe("GET /produtos/:id", () => {
    test("Retorna 200 e o produto quando o id existe", async () => {
      const res = await request(app).get("/produtos/1")

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("id")
    })

    test("Retorna 404 quando o produto não existe", async () => {
      const res = await request(app).get("/produtos/999999")

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("erro")
    })
  })

  describe("POST /produtos", () => {
    test("Deve retornar 201 e o produto criado com id gerado", async () => {
      const novoProduto = {
        nome: "Pizza",
        preco: 30
      }

      const res = await request(app)
        .post("/produtos")
        .send(novoProduto)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("id")
      expect(res.body.nome).toBe("Pizza")
      expect(res.body.preco).toBe(30)
    })

    test("Deve retornar 400 quando o nome estiver faltando", async () => {
      const res = await request(app)
        .post("/produtos")
        .send({
          preco: 30
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("erro")
    })

    test("Deve retornar 400 quando o preco estiver faltando", async () => {
      const res = await request(app)
        .post("/produtos")
        .send({
          nome: "Pizza"
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("erro")
    })

    test("O produto criado deve aparecer no GET /produtos", async () => {
      const novoProduto = {
        nome: "Hambúrguer",
        preco: 25
      }

      const postRes = await request(app)
        .post("/produtos")
        .send(novoProduto)

      const getRes = await request(app)
        .get("/produtos")

      expect(postRes.status).toBe(201)
      expect(getRes.status).toBe(200)

      expect(getRes.body).toContainEqual(postRes.body)
    })
  })

  describe("DELETE /produtos/:id", () => {
    test("Deve retornar 204 quando o produto for removido com sucesso", async () => {
      const postRes = await request(app)
        .post("/produtos")
        .send({
          nome: "Produto para remover",
          preco: 10
        })

      const id = postRes.body.id

      const deleteRes = await request(app)
        .delete(`/produtos/${id}`)

      expect(deleteRes.status).toBe(204)
    })

    test("O produto removido não deve mais aparecer no GET /produtos/:id", async () => {
      const postRes = await request(app)
        .post("/produtos")
        .send({
          nome: "Produto temporário",
          preco: 15
        })

      const id = postRes.body.id

      await request(app)
        .delete(`/produtos/${id}`)

      const getRes = await request(app)
        .get(`/produtos/${id}`)

      expect(getRes.status).toBe(404)
    })

    test("Deve retornar 404 quando o produto não existir", async () => {
      const res = await request(app)
        .delete("/produtos/999999")

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("erro")
    })
  })
})
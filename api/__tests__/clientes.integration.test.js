const request = require('supertest');
const createApp = require('../app');

describe('API /clientes (integracao com supertest)', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /clientes', () => {
    test('retorna 200 e um array com os clientes iniciais', async () => {
      const res = await request(app).get('/clientes');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /clientes/:id', () => {
    test('retorna 200 e o cliente quando o id existe', async () => {
      const res = await request(app).get('/clientes/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('nome', 'Ana Souza');
      expect(res.body).toHaveProperty('email', 'ana@email.com');
    });

    test('retorna 404 com mensagem de erro quando o cliente nao existe', async () => {
      const res = await request(app).get('/clientes/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('POST /clientes', () => {
    test('retorna 201 e o cliente criado com id gerado', async () => {
      const novoCliente = { nome: 'Carlos Melo', email: 'carlos@email.com' };

      const res = await request(app).post('/clientes').send(novoCliente);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome', 'Carlos Melo');
      expect(res.body).toHaveProperty('email', 'carlos@email.com');
    });

    test('retorna 400 quando o nome esta faltando', async () => {
      const res = await request(app)
        .post('/clientes')
        .send({ email: 'sememnome@email.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o email esta faltando', async () => {
      const res = await request(app)
        .post('/clientes')
        .send({ nome: 'Sem Email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o email ja esta cadastrado', async () => {
      const res = await request(app)
        .post('/clientes')
        .send({ nome: 'Outro Ana', email: 'ana@email.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('cliente criado aparece em GET /clientes', async () => {
      await request(app)
        .post('/clientes')
        .send({ nome: 'Diana Reis', email: 'diana@email.com' });

      const res = await request(app).get('/clientes');

      const emails = res.body.map((c) => c.email);
      expect(emails).toContain('diana@email.com');
    });
  });

  describe('PUT /clientes/:id', () => {
    test('retorna 200 e o cliente atualizado quando o id existe', async () => {
      const res = await request(app)
        .put('/clientes/1')
        .send({ nome: 'Ana Souza Silva' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('nome', 'Ana Souza Silva');
    });

    test('retorna 404 quando o cliente nao existe', async () => {
      const res = await request(app)
        .put('/clientes/999')
        .send({ nome: 'Qualquer' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o novo email ja pertence a outro cliente', async () => {
      const res = await request(app)
        .put('/clientes/1')
        .send({ email: 'bruno@email.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('DELETE /clientes/:id', () => {
    test('retorna 204 quando o cliente e removido com sucesso', async () => {
      const res = await request(app).delete('/clientes/1');

      expect(res.status).toBe(204);
    });

    test('cliente removido nao aparece mais na listagem', async () => {
      await request(app).delete('/clientes/1');

      const res = await request(app).get('/clientes/1');

      expect(res.status).toBe(404);
    });

    test('retorna 404 quando o cliente nao existe', async () => {
      const res = await request(app).delete('/clientes/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });
  });
});
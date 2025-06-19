const request = require("supertest");
const app = require("../server");

jest.mock("../utils/langfuse.utils", () => ({
  default: {
    trace: jest.fn(() => ({
      generation: jest.fn(() => ({
        end: jest.fn(),
      })),
    })),
  },
}));

describe("POST /api/prompts", () => {
  it("deve criar um prompt e rastrear com Langfuse", async () => {
    // Simule um token de autenticação válido ou ajuste o middleware para testes
    const response = await request(app)
      .post("/api/prompts")
      .send({ content: "Teste de integração Langfuse" })
      .set("Accept", "application/json");
    // .set('Authorization', 'Bearer <token>') // se necessário

    // Espera status 201 e propriedades no body
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("prompt");
    expect(response.body).toHaveProperty("response");
    // Aqui você pode verificar se o mock do Langfuse foi chamado
  });
});

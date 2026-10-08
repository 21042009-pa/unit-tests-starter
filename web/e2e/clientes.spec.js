import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Clientes" }).click();
});

//c1

test("Listar os clientes iniciais", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(3);
    await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Bruno Lima" })).toBeVisible();
})

//c2
test("Cadastrar um cliente novo", async ({ page }) => {
    await page.getByLabel("Nome").fill("Carla Dias");
    await page.getByLabel("Email").fill("carla@email.com");
    await page.getByRole("button", { name: "Cadastrar" }).click();
    const linha = page.getByRole("row", { name: /Carla Dias/ });
        await expect(linha).toBeVisible();
})

//c3
test("Validar campos obrigatorios", async ({ page }) => {
    await page.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page.getByText("Nome e email sao obrigatorios")).toBeVisible();
})

//c4
test("Impedir email duplicado", async ({ page }) => {
    await page.getByLabel("Nome").fill("Teste");
    await page.getByLabel("Email").fill("ana@email.com");
    await page.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page.getByText("Email ja cadastrado")).toBeVisible();
})

//c5
test("Editar um cliente", async ({ page }) => {
    const linha = page.getByRole("row", { name: /Bruno Lima/ });
    await linha.getByRole("button", { name: "Editar" }).click();
    await expect(page.getByLabel("Nome")).toHaveValue("Bruno Lima");
    await expect(page.getByLabel("Email")).toHaveValue("bruno@email.com");
    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cadastrar" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
    await page.getByLabel("Nome").fill("Bruno Lima Silva");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("cell", { name: "Bruno Lima Silva" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelar" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();
    await expect(page.getByLabel("Nome")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
});
 
//c6
test("Cancelar edicao", async ({ page }) => {
    const linha = page.getByRole("row", { name: /Ana Souza/ });
    await linha.getByRole("button", { name: "Editar" }).click();
    await page.getByLabel("Nome").fill("Ana Alterada");
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByLabel("Nome")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Cancelar" })).not.toBeVisible();
    await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Ana Alterada" })).toHaveCount(0);
});
 
//c7
test("Editar para um email ja usado", async ({ page }) => {
    const linha = page.getByRole("row", { name: /Bruno Lima/ });
    await linha.getByRole("button", { name: "Editar" }).click();
    await page.getByLabel("Email").fill("ana@email.com");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Email ja cadastrado")).toBeVisible();
    await expect(linha.getByRole("cell", { name: "bruno@email.com" })).toBeVisible();
});
 
//c8
test("Remover um cliente", async ({ page }) => {
    const linha = page.getByRole("row", { name: /Bruno/ });
    await linha.getByRole("button", { name: "Remover" }).click();
    await expect(linha).toHaveCount(0);
    await expect(page.getByRole("row")).toHaveCount(2);
});
 
//c9 (desafio)
test("Fluxo completo de cliente", async ({ page }) => {
    await page.getByLabel("Nome").fill("Diego");
    await page.getByLabel("Email").fill("diego@email.com");
    await page.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page.getByRole("row", { name: /Diego/ })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(4);
    await page.getByRole("row", { name: /Diego/ }).getByRole("button", { name: "Editar" }).click();
    await page.getByLabel("Nome").fill("Diego Matos");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("cell", { name: "Diego Matos" })).toBeVisible();
    await page.getByLabel("Nome").fill("Outro Diego");
    await page.getByLabel("Email").fill("diego@email.com");
    await page.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page.getByText("Email ja cadastrado")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(4);
    const linhaDiego = page.getByRole("row", { name: /Diego Matos/ });
    await linhaDiego.getByRole("button", { name: "Remover" }).click();
    await expect(linhaDiego).toHaveCount(0);
    await expect(page.getByRole("row")).toHaveCount(3);
});


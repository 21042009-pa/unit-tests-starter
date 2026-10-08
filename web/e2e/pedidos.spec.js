import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();
});

async function adicionarItem(page, produto, quantidade = "1") {
    await page.getByLabel("Produto", { exact: true }).selectOption({ label: produto });
    await page.getByLabel("Quantidade").fill(quantidade);
    await page.getByRole("button", { name: "Adicionar item" }).click();
}

//p1
test("Listar os pedidos iniciais", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
    const linha = page.getByRole("row", { name: /Ana Souza/ });
    await expect(linha.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
    await expect(linha.getByRole("cell", { name: "2x Coxinha" })).toBeVisible();
    await expect(linha.getByRole("cell", { name: "R$ 10,00" })).toBeVisible();
    await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});
 
//p2
test("Montar um pedido com um item", async ({ page }) => {
    await page.getByLabel("Cliente", { exact: true }).selectOption({ label: "Bruno Lima" });
    await adicionarItem(page, "Pastel");
    await expect(page.getByText("1x Pastel")).toBeVisible();
    await page.getByRole("button", { name: "Criar pedido" }).click();
    await expect(page.getByRole("row")).toHaveCount(3);
    const linha = page.getByRole("row", { name: /Bruno Lima/ });
    await expect(linha.getByRole("cell", { name: "Bruno Lima" })).toBeVisible();
    await expect(linha.getByRole("cell", { name: "1x Pastel" })).toBeVisible();
    await expect(linha.getByRole("cell", { name: "R$ 8,00" })).toBeVisible();
    await expect(page.getByLabel("Status do pedido 2")).toHaveValue("pendente");
    await expect(page.getByLabel("Cliente", { exact: true })).toHaveValue("");
    await expect(page.getByText("1x Pastel")).toHaveCount(1);
});
 
//p3
test("Montar um pedido com varios itens e quantidades", async ({ page }) => {
    await page.getByLabel("Cliente", { exact: true }).selectOption({ label: "Ana Souza" });
    await adicionarItem(page, "Coxinha", "3");
    await adicionarItem(page, "Empada", "1");
    await page.getByRole("button", { name: "Criar pedido" }).click();
    const linha = page.getByRole("row", { name: /R\$ 21,00/ });
    await expect(linha).toBeVisible();
    await expect(linha).toContainText("3x Coxinha");
    await expect(linha).toContainText("1x Empada");
});
 
//p4
test("Quantidade volta a 1 apos adicionar item", async ({ page }) => {
    await adicionarItem(page, "Coxinha", "5");
    await expect(page.getByLabel("Quantidade")).toHaveValue("1");
});
 
//p5
test("Nao criar pedido sem cliente", async ({ page }) => {
    await adicionarItem(page, "Coxinha");
    await page.getByRole("button", { name: "Criar pedido" }).click();
 
    await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
});
 
//p6
test("Nao criar pedido sem itens", async ({ page }) => {
    await page.getByLabel("Cliente", { exact: true }).selectOption({ label: "Ana Souza" });
    await page.getByRole("button", { name: "Criar pedido" }).click();
    await expect(page.getByText("Pedido deve ter ao menos um item")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
});
 
//p7
test("Alterar o status de um pedido", async ({ page }) => {
    const status = page.getByLabel("Status do pedido 1");
    await status.selectOption("pago");
    await expect(status).toHaveValue("pago");
});
 
//p8
test("Pedido cancelado nao pode ser alterado", async ({ page }) => {
    const status = page.getByLabel("Status do pedido 1");
    await status.selectOption("cancelado");
    await expect(status).toHaveValue("cancelado");
    await status.selectOption("pago");
    await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
    await expect(status).toHaveValue("cancelado");
});
 
//p9
test("Remover um pedido", async ({ page }) => {
    const linha = page.getByRole("row", { name: /Ana Souza/ });
    await linha.getByRole("button", { name: "Remover" }).click();
    await expect(linha).toHaveCount(0);
    await expect(page.getByRole("row")).toHaveCount(1);
});
 
//p10 (desafio)
test("Ciclo completo do pedido", async ({ page }) => {
    await page.getByLabel("Cliente", { exact: true }).selectOption({ label: "Bruno Lima" });
    await adicionarItem(page, "Empada", "2");
    await expect(page.getByText("2x Empada")).toBeVisible();
    await page.getByRole("button", { name: "Criar pedido" }).click();
    const linha = page.getByRole("row", { name: /Bruno Lima/ });
    const status = page.getByLabel("Status do pedido 2");
    await expect(linha.getByRole("cell", { name: "R$ 12,00" })).toBeVisible();
    await expect(status).toHaveValue("pendente");
    await expect(page.getByRole("row")).toHaveCount(3);
    await status.selectOption("pago");
    await expect(status).toHaveValue("pago");
    await status.selectOption("cancelado");
    await expect(status).toHaveValue("cancelado");
    await status.selectOption("pendente");
    await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
    await expect(status).toHaveValue("cancelado");
    await linha.getByRole("button", { name: "Remover" }).click();
    await expect(linha).toHaveCount(0);
    await expect(page.getByRole("row")).toHaveCount(2);
});
 


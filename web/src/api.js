// Todas as chamadas passam pelo proxy do Vite: /api/... -> http://localhost:3000/...
const BASE_URL = '/api';

const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar à API';

async function requisicao(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(BASE_URL + caminho, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new Error(MENSAGEM_SEM_CONEXAO);
  }

  // 204 = sucesso sem corpo (ex.: exclusao)
  if (resposta.status === 204) return null;

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    throw new Error(MENSAGEM_SEM_CONEXAO);
  }

  if (!resposta.ok) {
    throw new Error(dados.erro);
  }

  return dados;
}

function enviar(metodo, caminho, corpo) {
  return requisicao(caminho, { method: metodo, body: JSON.stringify(corpo) });
}

// Produtos
export const listarProdutos = () => requisicao('/produtos');
export const criarProduto = (produto) => enviar('POST', '/produtos', produto);
export const removerProduto = (id) => requisicao(`/produtos/${id}`, { method: 'DELETE' });

// Clientes
export const listarClientes = () => requisicao('/clientes');
export const criarCliente = (cliente) => enviar('POST', '/clientes', cliente);
export const atualizarCliente = (id, cliente) => enviar('PUT', `/clientes/${id}`, cliente);
export const removerCliente = (id) => requisicao(`/clientes/${id}`, { method: 'DELETE' });

// Pedidos
export const listarPedidos = () => requisicao('/pedidos');
export const criarPedido = (pedido) => enviar('POST', '/pedidos', pedido);
export const atualizarStatusPedido = (id, status) =>
  enviar('PATCH', `/pedidos/${id}/status`, { status });
export const removerPedido = (id) => requisicao(`/pedidos/${id}`, { method: 'DELETE' });

// Formata numero como moeda: 18 -> "R$ 18,00"
const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoeda = (valor) => formatador.format(valor);

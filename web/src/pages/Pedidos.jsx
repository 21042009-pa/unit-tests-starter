import { useEffect, useState } from 'react';
import {
  atualizarStatusPedido,
  criarPedido,
  formatarMoeda,
  listarClientes,
  listarPedidos,
  listarProdutos,
  removerPedido,
} from '../api.js';

// Transforma a lista de itens em texto: "2x Coxinha, 1x Pastel"
function descreverItens(itens) {
  return itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Formulario do novo pedido
  const [cliente, setCliente] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [itens, setItens] = useState([]);

  async function carregarPedidos() {
    setPedidos(await listarPedidos());
  }

  useEffect(() => {
    async function carregarTudo() {
      try {
        const [listaClientes, listaProdutos] = await Promise.all([
          listarClientes(),
          listarProdutos(),
        ]);
        setClientes(listaClientes);
        setProdutos(listaProdutos);
        if (listaProdutos.length > 0) setProdutoId(String(listaProdutos[0].id));
        await carregarPedidos();
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarTudo();
  }, []);

  function adicionarItem() {
    const produto = produtos.find((p) => String(p.id) === produtoId);
    if (!produto) return;
    setItens([
      ...itens,
      { nome: produto.nome, precoUnitario: produto.preco, quantidade: Number(quantidade) },
    ]);
    setQuantidade('1');
  }

  function removerItem(indice) {
    setItens(itens.filter((_, i) => i !== indice));
  }

  // Executa uma acao na API e, se der certo, limpa o erro e recarrega a tabela
  async function executar(acao) {
    try {
      await acao();
      setErro('');
      await carregarPedidos();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function criar(evento) {
    evento.preventDefault();
    await executar(async () => {
      await criarPedido({ cliente, itens });
      setCliente('');
      setItens([]);
    });
  }

  return (
    <section>
      <h1>Pedidos</h1>

      {erro && <p role="alert" className="erro">{erro}</p>}

      <form onSubmit={criar} className="formulario">
        <div className="campo">
          <label htmlFor="pedido-cliente">Cliente</label>
          <select id="pedido-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}>
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="linha-item">
          <div className="campo">
            <label htmlFor="pedido-produto">Produto</label>
            <select
              id="pedido-produto"
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
            >
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="pedido-quantidade">Quantidade</label>
            <input
              id="pedido-quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
          <button type="button" className="secundario" onClick={adicionarItem}>
            Adicionar item
          </button>
        </div>

        {itens.length > 0 && (
          <ul className="itens">
            {itens.map((item, indice) => (
              <li key={indice}>
                {item.quantidade}x {item.nome}
                <button type="button" className="perigo" onClick={() => removerItem(indice)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit">Criar pedido</button>
      </form>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.cliente}</td>
                <td>{descreverItens(pedido.itens)}</td>
                <td>{formatarMoeda(pedido.total)}</td>
                <td>{pedido.status}</td>
                <td className="acoes">
                  <button
                    className="secundario"
                    disabled={pedido.status !== 'pendente'}
                    onClick={() => executar(() => atualizarStatusPedido(pedido.id, 'pago'))}
                  >
                    Marcar como pago
                  </button>
                  <button
                    className="secundario"
                    disabled={pedido.status === 'cancelado'}
                    onClick={() => executar(() => atualizarStatusPedido(pedido.id, 'cancelado'))}
                  >
                    Cancelar pedido
                  </button>
                  <button
                    className="perigo"
                    onClick={() => executar(() => removerPedido(pedido.id))}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

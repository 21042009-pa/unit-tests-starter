import { useEffect, useState } from 'react';
import { criarProduto, formatarMoeda, listarProdutos, removerProduto } from '../api.js';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  async function carregar() {
    try {
      setProdutos(await listarProdutos());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cadastrar(evento) {
    evento.preventDefault();
    try {
      await criarProduto({ nome, preco: Number(preco) });
      setErro('');
      setNome('');
      setPreco('');
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function excluir(id) {
    try {
      await removerProduto(id);
      setErro('');
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <section>
      <h1>Produtos</h1>

      {erro && <p role="alert" className="erro">{erro}</p>}

      <form onSubmit={cadastrar} className="formulario">
        <div className="campo">
          <label htmlFor="produto-nome">Nome</label>
          <input id="produto-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="produto-preco">Preço</label>
          <input
            id="produto-preco"
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
        </div>
        <button type="submit">Cadastrar produto</button>
      </form>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.nome}</td>
                <td>{formatarMoeda(produto.preco)}</td>
                <td>
                  <button className="perigo" onClick={() => excluir(produto.id)}>
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

import { useEffect, useState } from 'react';
import { atualizarCliente, criarCliente, listarClientes, removerCliente } from '../api.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  // null = cadastrando um novo cliente; numero = id do cliente em edicao
  const [editandoId, setEditandoId] = useState(null);

  async function carregar() {
    try {
      setClientes(await listarClientes());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparFormulario() {
    setNome('');
    setEmail('');
    setEditandoId(null);
  }

  async function salvar(evento) {
    evento.preventDefault();
    try {
      if (editandoId === null) {
        await criarCliente({ nome, email });
      } else {
        await atualizarCliente(editandoId, { nome, email });
      }
      setErro('');
      limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function editar(cliente) {
    setEditandoId(cliente.id);
    setNome(cliente.nome);
    setEmail(cliente.email);
  }

  async function excluir(id) {
    try {
      await removerCliente(id);
      setErro('');
      if (id === editandoId) limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <section>
      <h1>Clientes</h1>

      {erro && <p role="alert" className="erro">{erro}</p>}

      <form onSubmit={salvar} className="formulario">
        <div className="campo">
          <label htmlFor="cliente-nome">Nome</label>
          <input id="cliente-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="cliente-email">E-mail</label>
          <input id="cliente-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {editandoId === null ? (
          <button type="submit">Cadastrar cliente</button>
        ) : (
          <>
            <button type="submit">Salvar alterações</button>
            <button type="button" className="secundario" onClick={limparFormulario}>
              Cancelar edição
            </button>
          </>
        )}
      </form>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.email}</td>
                <td className="acoes">
                  <button className="secundario" onClick={() => editar(cliente)}>
                    Editar
                  </button>
                  <button className="perigo" onClick={() => excluir(cliente.id)}>
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

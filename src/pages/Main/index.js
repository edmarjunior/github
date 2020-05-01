import React, { Component } from 'react';
import { FaGithub, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';

import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { newRepo, repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }

    if (prevState.newRepo !== newRepo) {
      this.verifyDuplicate();
    }
  }

  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async (e) => {
    try {
      e.preventDefault();

      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      this.verifyDuplicate();

      if (this.state.error) {
        throw new Error(this.state.error);
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (error) {
      const errorMessage =
        error.response && error.response.status === 404
          ? 'Repositório não encontrado'
          : error.message;

      this.setState({ error: errorMessage });
    } finally {
      this.setState({ loading: false });
    }
  };

  verifyDuplicate = () => {
    const { newRepo, repositories } = this.state;

    if (repositories.filter((repo) => repo.name === newRepo).length) {
      this.setState({ error: 'Repositório já adicionado' });
      return;
    }
    this.setState({ error: '' });
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithub />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} error={error.length > 0}>
          {error.length > 0 && <span>{error}</span>}
          <div>
            <input
              type="text"
              placeholder="Adicionar repositório"
              value={newRepo}
              onChange={this.handleInputChange}
            />
            <SubmitButton loading={loading} error={error.length > 0}>
              {loading ? <FaSpinner /> : <FaPlus color="#FFF" size={14} />}
            </SubmitButton>
          </div>
        </Form>
        <List>
          {repositories.map((repo) => (
            <li key={repo.name}>
              <span>{repo.name}</span>
              <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

/**
 * Created by axetroy on 17-4-6.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Input, Spin } from 'antd';
import queryString from 'query-string';
import github from '../../lib/github';

const Search = Input.Search;

import DocumentTitle from '../../component/document-title';
import pkg from '../../../package.json';
const { owner, repo: blog_repo, todo_repo } = pkg.config;

import './index.css';

class SearchComponent extends Component {
  state = {
    pending: false,
    posts: [],
    repos: [],
    todos: []
  };
  componentDidMount() {
    const query = queryString.parse(this.props.location.search);
    if (query.q) {
      this.search(query.q);
    }
  }

  async search(keyword) {
    this.setState({ keyword, pending: true });
    await [
      this.searchPost(keyword),
      this.searchRepo(keyword),
      this.searchTodo(keyword)
    ];
    this.setState({ pending: false });
  }

  async searchPost(keyword) {
    try {
      const { data } = await github.get(
        `/search/issues?q=${keyword}+repo:${owner}/${blog_repo}+author:${owner}+is:open`
      );
      this.setState({ posts: data.items });
    } catch (err) {
      console.error(err);
    }
  }

  async searchTodo(keyword) {
    try {
      const { data } = await github.get(
        `/search/issues?q=${keyword}+repo:${owner}/${todo_repo}+author:${owner}`
      );
      this.setState({ todos: data.items });
    } catch (err) {
      console.error(err);
    }
  }

  async searchRepo(keyword) {
    try {
      const { data } = await github.get(
        `/search/repositories?q=${keyword}+user:${owner}`
      );
      this.setState({ repos: data.items });
    } catch (err) {
      console.error(err);
    }
  }

  renderPost() {
    return (
      <div>
        <h2>博客文章</h2>
        {this.state.posts.length
          ? this.state.posts.map(post => {
              return (
                <div key={post.id} className="search-r">
                  <h4>
                    <Link to={`/post/${post.number}`}>{post.title}</Link>
                  </h4>
                </div>
              );
            })
          : <div>
              Not Found!
            </div>}
      </div>
    );
  }

  renderRepo() {
    return (
      <div>
        <h2>开源项目</h2>
        {this.state.repos.length
          ? this.state.repos.map(repo => {
              return (
                <div key={repo.name} className="search-r">
                  <h4>
                    <Link to={`/repo/${repo.name}`}>{repo.name}</Link>
                  </h4>
                </div>
              );
            })
          : <div>
              Not Found!
            </div>}
      </div>
    );
  }

  renderTodo() {
    return (
      <div>
        <h2>计划任务</h2>
        {this.state.todos.length
          ? this.state.todos.map(todo => {
              return (
                <div key={todo.id} className="search-r">
                  <h4>
                    <Link to={`/todo/${todo.number}`}>{todo.title}</Link>
                  </h4>
                </div>
              );
            })
          : <div>
              Not Found!
            </div>}
      </div>
    );
  }

  render() {
    return (
      <DocumentTitle
        title={this.state.keyword ? '搜索: ' + this.state.keyword : '搜索'}
      >
        <div>
          <div style={{ textAlign: 'center' }}>
            <Search
              value={this.state.keyword}
              placeholder="Search and Press Enter!"
              style={{ width: '30rem', marginBottom: '2rem' }}
              onChange={e => {
                this.setState({ keyword: e.currentTarget.value });
              }}
              onSearch={value => {
                const oldQuery = queryString.parse(this.props.location.search);
                this.props.history.push({
                  ...this.props.location,
                  search: queryString.stringify({
                    ...oldQuery,
                    ...{ q: value }
                  })
                });
                this.search(value);
              }}
            />
          </div>

          <Spin tip="searching..." spinning={this.state.pending}>
            <Row>
              <Col span={8}>
                {this.renderPost()}
              </Col>
              <Col span={8}>
                {this.renderRepo()}
              </Col>
              <Col span={8}>
                {this.renderTodo()}
              </Col>
            </Row>
          </Spin>

        </div>
      </DocumentTitle>
    );
  }
}
export default connect(
  function mapStateToProps(state) {
    return {};
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
  }
)(SearchComponent);
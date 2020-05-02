import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterProps from 'react-router-prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Card from '../components/Card/Card';

const FeedWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin: 5%;
`;

const Alert = styled.div`
  text-align: center;
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const PaginationBar = styled.div`
  width: 100%;
  display: flex;
  align: center;
  justify-content: flex-end;
`;

const PaginationLink = styled(Link)`
  padding: 1%;
  background: lightblue;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  margin: ${props => (props.page > 1 ? '0 0 0 88.5%' : '0')};
`;

const ROOT_API = 'https://api.stackexchange.com/2.2/';

class Feed extends Component {
  constructor(props) {
    super(props);
    const query = queryString.parse(props.location.search);
    this.state = {
      data: [],
      page: query.page ? parseInt(query.page, 10) : 1,
      loading: true,
      error: '',
    };
  }

  async fetchApi(page) {
    try {
      const data = await fetch(
        `${ROOT_API}questions?order=desc&sort=activity&tagged=reactjs&site=stackoverflow${
          page ? `&page=${page}` : ''
        }`
      );
      const dataJSON = await data.json();

      if (dataJSON) {
        this.setState({
          data: dataJSON,
          loading: false,
        });
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message,
      });
    }
  }

  componentDidMount() {
    const { page } = this.state;
    this.fetchApi(page);
  }

  componentDidUpdate(prevProps) {
    const { page } = this.state;
    const { location } = this.props;
    if (prevProps.location.search !== location.search) {
      const query = queryString.parse(location.search);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          page: parseInt(query.page, 10),
        },
        () => {
          this.fetchApi(page);
        }
      );
    }
  }

  render() {
    const { data, loading, error, page } = this.state;
    const { match } = this.props;

    if (loading || error) {
      return <Alert>{loading ? 'Loading...' : error}</Alert>;
    }

    return (
      <FeedWrapper>
        {data.items.map(item => (
          <CardLink key={item.question_id} to={`/questions/${item.question_id}`}>
            <Card data={item} />
          </CardLink>
        ))}
        <PaginationBar>
          {page > 1 && (
            <PaginationLink to={`${match.url}?page=${page - 1}`} page={page}>
              Previous
            </PaginationLink>
          )}
          {data.has_more && (
            <PaginationLink
              style={{ flex: 'right' }}
              to={`${match.url}?page=${page + 1}`}
              page={page}>
              Next
            </PaginationLink>
          )}
        </PaginationBar>
      </FeedWrapper>
    );
  }
}

Feed.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  match: ReactRouterProps.match.isRequired,
};

export default Feed;

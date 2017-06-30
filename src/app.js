// ----------------------
// IMPORTS

/* NPM */

// React
import React from 'react';
import PropTypes from 'prop-types';

// GraphQL
import { graphql } from 'react-apollo';

// Listen to Redux store state
import { connect } from 'react-redux';

// Routing
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

// <Helmet> component for setting the page title
import Helmet from 'react-helmet';

/* Local */

// NotFound 404 handler for unknown routes
import { NotFound, Redirect } from 'kit/lib/routing';

// GraphQL queries
import allMessages from 'src/queries/all_messages.gql';
import latestPdf from 'src/queries/latest_pdf.gql';

// Styles
import './styles.global.css';
import css from './styles.css';
import sass from './styles.scss';
import less from './styles.less';

// Get the ReactQL logo.  This is a local .svg file, which will be made
// available as a string relative to [root]/dist/assets/img/
import logo from './reactql-logo.svg';

// ----------------------

// We'll display this <Home> component when we're on the / route
const Home = () => (
  <LatestPDF />
);

// Helper component that will be conditionally shown when the route matches.
// This gives you an idea how React Router v4 works
const Page = ({ match }) => (
  <h1>Changed route: {match.params.name}</h1>
);

// Create a route that will be displayed when the code isn't found
const WhenNotFound = () => (
  <NotFound>
    <h1>Unknown route - the 404 handler was triggered!</h1>
  </NotFound>
);

// Specify PropTypes if the `match` object, which is injected to props by
// the <Route> component
Page.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

// Stats pulled from the environment.  This demonstrates how data will
// change depending where we're running the code (environment vars, etc)
// and also how we can connect a 'vanilla' React component to an RxJS
// observable source, and feed eventual values in as properties
const Stats = () => {
  const info = [
    ['Environment', process.env.NODE_ENV],
  ];

  return (
    <ul className={css.data}>
      {info.map(([key, val]) => (
        <li key={key}>{key}: <span>{val}</span></li>
      ))}
    </ul>
  );
};

// Now, let's create a GraphQL-enabled component...
import {FILES} from 'config/project'
import Dropzone from 'react-dropzone'
import PDFViewer from 'src/PDFViewer'

@graphql(latestPdf)
class LatestPDF extends React.Component
{
  state = {uploading: false, hasFile: false}
  onDrop(files)
  {
    // prepare form data, use data key!
    let data = new FormData()
    data.append('data', files[0])

    // use the file endpoint
    fetch(FILES.uri, {
      method: 'POST',
      body: data
    }).then(response => {
      return response.json()
    }).then(file => {
      this.setState({
        uploading: false,
        hasFile: true
      })
      this.props.data.refetch()
    })
  }
  render()
  {
    const {data: {loading, refetch, allFiles}} = this.props
    if(loading) return <h2>Loading Latest PDF...</h2>
    const {url, name} = allFiles[0]
    return (
      <div>
        {!this.state.hasFile &&
          <div>
            <div>
              <Dropzone
                onDrop={this.onDrop.bind(this)}
                multiple={false}
                style={{backgroundColor: '#eee', width: '100%', height: 200, padding: 30, border: '4px dotted #444', cursor: 'pointer'}}
                activeStyle={{backgroundColor: '#99FF99', width: '100%', height: 200, padding: 30, border: '4px dotted #444', cursor: 'pointer'}}
                onDropAccepted={() => {this.setState({uploading: true})}}
                >
                <div>
                  {this.state.uploading ? (
                    <div>Uploading File...</div>
                  ) : (
                    <div>Drop an image or click to choose</div>
                  )}
                </div>
              </Dropzone>
            </div>
          </div>
        }
        {url ? (
          <div>
            <h2>PDF: {name}</h2>
            <PDFViewer url={url}/>
          </div>
        ) : (
          <h2>No PDFs</h2>
        )}
      </div>
    )
  }
}


// ... then, let's create the component and decorate it with the `graphql`
// HOC that will automatically populate `this.props` with the query data
// once the GraphQL API request has been completed
@graphql(allMessages)
class GraphQLMessage extends React.PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      allMessages: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired,
        }),
      ),
    }),
  }

  render() {
    const { data } = this.props;
    const message = data.allMessages && data.allMessages[0].text;
    const isLoading = data.loading ? 'yes' : 'nope';
    return (
      <div>
        <h2>Message from GraphQL server: <em>{message}</em></h2>
      </div>
    );
  }
}

// Example of CSS, SASS and LESS styles being used together
const Styles = () => (
  <ul className={css.styleExamples}>
    <li className={css.example}>Styled by CSS</li>
    <li className={sass.example}>Styled by SASS</li>
    <li className={less.example}>Styled by LESS</li>
  </ul>
);

// Sample component that demonstrates using a part of the Redux store
// outside of Apollo.  We can import own custom reducers in `kit/lib/redux`
// and 'listen' to them here
@connect(state => ({ counter: state.counter }))
class ReduxCounter extends React.PureComponent {
  static propTypes = {
    counter: PropTypes.shape({
      count: PropTypes.number.isRequired,
    }),
  };

  // Trigger the `INCREMENT_COUNTER` action in Redux, to add 1 to the total
  triggerIncrement = () => {
    this.props.dispatch({
      type: 'INCREMENT_COUNTER',
    });
  }

  render() {
    const { count } = this.props.counter;
    return (
      <div>
        <h2>Listening to Redux counter: {count}</h2>
        <button onClick={this.triggerIncrement}>Increment</button>
      </div>
    );
  }
}

// Export a simple component that allows clicking on list items to change
// the route, along with a <Route> 'listener' that will conditionally display
// the <Page> component based on the route name
export default () => (
  <div>
    <Helmet
      title="ReactQL application"
      meta={[{
        name: 'description',
        content: 'ReactQL starter kit app',
      }]} />
    <div className={css.hello}>
      <img src={logo} alt="ReactQL" className={css.logo} />
    </div>
    <hr />
    <GraphQLMessage />
    <hr />
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/page/:name" component={Page} />
      <Redirect from="/old/path" to="/new/path" />
      <Route component={WhenNotFound} />
    </Switch>
  </div>
);

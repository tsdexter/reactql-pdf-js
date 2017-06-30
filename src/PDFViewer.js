import React from 'react';

// UI
import PDF from 'react-pdf-js';

class PDFViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
  }

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages });
  }

  onPageComplete(page) {
    this.setState({ page });
  }

  handlePrevious() {
    this.setState({ page: this.state.page - 1 });
  }

  handleNext() {
    this.setState({ page: this.state.page + 1 });
  }

  renderPagination(page, pages) {
    const previousButton = <button disabled={page === 1} onClick={this.handlePrevious}>Previous Page</button>
    const nextButton = <button disabled={page === pages} onClick={this.handleNext}>Next Page</button>
    return (
      <div>
        {previousButton}
        <span>{`Page ${page} / ${pages}`}</span>
        {nextButton}
      </div>
    );
  }

  render() {
    const {url} = this.props
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    return (
      <div>
        {pagination}
        <div style={{border:"2px solid black"}}>
          <PDF file={url} onDocumentComplete={this.onDocumentComplete} onPageComplete={this.onPageComplete} page={this.state.page} />
        </div>
      </div>
    )
  }
}

export default PDFViewer

import React from 'react';
import PropTypes from 'prop-types';
import { LazyLog } from 'react-lazylog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faFileAlt } from '@fortawesome/free-solid-svg-icons';

import TextLogStepModel from '../../models/textLogStep';
import { getUrlParam } from '../../helpers/location';
import { getLogViewerUrl } from '../../helpers/url';

const getUrlLineNumber = function getUrlLineNumber() {
  const lineNumberParam = getUrlParam('lineNumber');

  if (lineNumberParam) {
    return lineNumberParam.split('-').map((line) => parseInt(line, 10));
  }
  return null;
};

const errorLinesCss = function errorLinesCss(logErrors) {
  const style = document.createElement('style');
  const rule = logErrors
    .map(({ lineNumber }) => `a[id="${lineNumber}"]+span`)
    .join(',')
    .concat('{background:#fbe3e3;color:#a94442}');

  style.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(style);
  style.sheet.insertRule(rule);
};

class LogTab extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      highlight: null,
    };
  }

  componentDidMount() {
    const {
      selectedJobFull: { id: jobId },
    } = this.props;

    TextLogStepModel.get(jobId).then((textLogSteps) => {
      const stepErrors = textLogSteps.length ? textLogSteps[0].errors : [];
      const logErrors = stepErrors.map((error) => ({
        line: error.line,
        lineNumber: error.line_number + 1,
      }));
      const firstErrorLineNumber = logErrors.length
        ? [logErrors[0].lineNumber]
        : null;
      const urlLN = getUrlLineNumber();
      const highlight = urlLN || firstErrorLineNumber;

      errorLinesCss(logErrors);
      this.setState({ highlight });
    });
  }

  render() {
    const { selectedJobFull, repoName } = this.props;
    const { highlight } = this.state;
    const { url } = selectedJobFull.logs[0];

    return (
      <div className="h-100 w-100" aria-label="Log">
        <span className="log-viewer-top-bar-buttons">
          <a
            className="p-1 mr-2 text-darker-secondary"
            href={getLogViewerUrl(selectedJobFull.id, repoName)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the full-screen Log Viewer for this task"
          >
            <FontAwesomeIcon icon={faExpand} className="mr-1" />
            Full Screen
          </a>
          <a
            className="p-2 text-darker-secondary"
            href={getLogViewerUrl(selectedJobFull.id, repoName)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the full-screen Log Viewer for this task"
          >
            <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
            Text Log
          </a>
        </span>
        <LazyLog
          url={url}
          scrollToLine={highlight ? highlight[0] : 0}
          highlight={highlight}
          selectableLines
          // onHighlight={this.onHighlight}
          // onLoad={() => this.scrollHighlightToTop(highlight)}
          highlightLineClassName="yellow-highlight"
          rowHeight={13}
          extraLines={3}
          enableSearch
          lineClassName="log-line"
        />
      </div>
    );
  }
}

LogTab.propTypes = {
  selectedJobFull: PropTypes.shape({}).isRequired,
  repoName: PropTypes.string.isRequired,
};

export default LogTab;

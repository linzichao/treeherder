import React from 'react';
import PropTypes from 'prop-types';
import { LazyLog } from 'react-lazylog';

import TextLogStepModel from '../models/textLogStep';
import { scrollToLine } from '../helpers/utils';

const errorLinesCss = function errorLinesCss(errors) {
  const style = document.createElement('style');
  const rule = errors
    .map(({ lineNumber }) => `a[id="${lineNumber}"]+span`)
    .join(',')
    .concat('{background:#fbe3e3;color:#a94442}');

  style.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(style);
  style.sheet.insertRule(rule);
};

class LogPanel extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      highlight: null,
    };
  }

  componentDidMount() {
    const {
      job: { id: jobId },
      urlLineNumber,
    } = this.props;

    TextLogStepModel.get(jobId).then((textLogSteps) => {
      const stepErrors = textLogSteps.length ? textLogSteps[0].errors : [];
      const errors = stepErrors.map((error) => ({
        line: error.line,
        lineNumber: error.line_number + 1,
      }));
      const firstErrorLineNumber = errors.length
        ? [errors[0].lineNumber]
        : null;
      const highlight = urlLineNumber || firstErrorLineNumber;

      errorLinesCss(errors);
      this.setState({ highlight });
    });
  }

  scrollHighlightToTop = (highlight) => {
    const lineAtTop = highlight && highlight[0] > 7 ? highlight[0] - 7 : 0;

    scrollToLine(`a[id="${lineAtTop}"]`, 100);
  };

  render() {
    const { job, onHighlight } = this.props;
    const { highlight } = this.state;
    const { url } = job.logs[0];

    return (
      <div className="h-100 mb-5 w-100" aria-label="Log">
        <LazyLog
          url={url}
          scrollToLine={highlight ? highlight[0] : 0}
          highlight={highlight}
          selectableLines
          onHighlight={onHighlight}
          onLoad={() => this.scrollHighlightToTop(highlight)}
          highlightLineClassName="yellow-highlight"
          rowHeight={13}
          extraLines={3}
          enableSearch
        />
      </div>
    );
  }
}

LogPanel.propTypes = {
  job: PropTypes.shape({}).isRequired,
  urlLineNumber: PropTypes.number,
  onHighlight: PropTypes.func,
};

LogPanel.defaultProps = {
  urlLineNumber: null,
  onHighlight: null,
};

export default LogPanel;

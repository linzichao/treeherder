import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { Badge, Button, Col, Row } from 'reactstrap';

import SimpleTooltip from '../shared/SimpleTooltip';
import { getBtnClass } from '../helpers/job';

class Job extends PureComponent {
  render() {
    const { job, onSelect } = this.props;
    const {
      id,
      result,
      state,
      failure_classification_id: failureClassificationId,
      job_type_name: jobName,
      job_type_symbol: jobSymbol,
      failedInParent,
    } = job;
    const resultStatus = state === 'completed' ? result : state;

    return (
      <span className="ml-1">
        <SimpleTooltip
          autohide={false}
          text={
            <span>
              <Button
                className={`p-1 rounded ${getBtnClass(
                  result,
                  failureClassificationId,
                )} border`}
                // href={getJobsUrl({ selectedJob: job.id, repo, revision })}
                onClick={onSelect}
              >
                {jobSymbol}
              </Button>
              {failureClassificationId !== 1 && (
                <FontAwesomeIcon
                  icon={faStar}
                  title="Classified"
                  color="lightgray"
                />
              )}
              {!!failedInParent && (
                <Badge color="info" className="ml-1">
                  Failed in parent
                </Badge>
              )}
            </span>
          }
          tooltipText={
            <Col className="align-items-start" key={id}>
              <Row className="mb-2">{jobName}</Row>
              <Row>Result: {resultStatus}</Row>
            </Col>
          }
        />
      </span>
    );
  }
}

Job.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number.isRequired,
    result: PropTypes.string.isRequired,
    failure_classification_id: PropTypes.number.isRequired,
    job_type_name: PropTypes.string.isRequired,
    job_type_symbol: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func,
};

Job.defaultProps = {
  onSelect: () => {},
};

export default Job;

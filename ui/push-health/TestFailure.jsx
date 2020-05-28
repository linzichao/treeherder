import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRedo,
  faCaretRight,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';

import JobModel from '../models/job';

import DetailsPanel from './details/DetailsPanel';

class TestFailure extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      detailsShowing: false,
      selectedJob: null,
      completed: false,
    };
  }

  toggleDetails = () => {
    const { selectedJob, detailsShowing } = this.state;
    const {
      failure: { failJobs },
    } = this.props;

    this.setState({
      detailsShowing: !detailsShowing,
      selectedJob: selectedJob ? null : failJobs[0],
    });
  };

  retriggerJob = async (job) => {
    const { notify, currentRepo } = this.props;

    JobModel.retrigger([job], currentRepo, notify);
  };

  setSelectedTask = (job) => {
    const { selectedJob } = this.state;

    if (selectedJob === job) {
      this.setState({ selectedJob: null, detailsShowing: false });
    } else {
      this.setState({ selectedJob: job, detailsShowing: true });
    }
  };

  toggleCompleted = () => {
    const { completed } = this.state;

    this.setState({ completed: !completed, detailsShowing: false });
  };

  render() {
    const { failure, revision, groupedBy, currentRepo } = this.props;
    const {
      testName,
      jobName,
      inProgressJobs,
      failJobs,
      passJobs,
      passInFailedJobs,
      platform,
      config,
      key,
      tier,
      failedInParent,
    } = failure;
    const { detailsShowing, selectedJob, completed } = this.state;
    const jobList = [
      ...failJobs,
      ...passJobs,
      ...passInFailedJobs,
      ...inProgressJobs,
    ];

    return (
      <Row
        className={`${completed ? 'strikethrough' : ''} border-top pt-2`}
        key={key}
      >
        <Row className="mx-5 w-100 mb-2 justify-content-between">
          <Col>
            <Row>
              <Button
                id={key}
                className="border-0  w-5 px-2 mx-2 text-darker-secondary"
                outline
                data-testid={`toggleDetails-${key}`}
                onClick={this.toggleDetails}
              >
                <FontAwesomeIcon
                  icon={detailsShowing ? faCaretDown : faCaretRight}
                  style={{ minWidth: '1em' }}
                  className="mr-1"
                />
                <span>
                  {groupedBy !== 'path' && `${testName} `}
                  {groupedBy !== 'platform' && `${platform} ${config}`}
                </span>
                <span className="ml-3">{jobName}</span>
              </Button>
            </Row>
          </Col>
          <Col className="ml-2">
            {tier > 1 && (
              <span className="ml-1 small text-muted">[tier-{tier}]</span>
            )}
            {jobList.map((job) => (
              <span key={job.id} className="mr-1">
                <Button
                  className="text-danger"
                  outline
                  onClick={() => this.setSelectedTask(job)}
                >
                  Task
                </Button>
              </span>
            ))}
            {!!failedInParent && <Badge color="info">Failed In Parent</Badge>}
          </Col>
          <Col xs="auto">
            <Button
              onClick={() => this.retriggerJob(failJobs[0])}
              outline
              className="mr-2 border-0"
              title="Retrigger job"
              style={{ lineHeight: '10px' }}
            >
              <FontAwesomeIcon icon={faRedo} />
            </Button>
          </Col>
        </Row>
        {detailsShowing && (
          <Row className="mx-3 w-100">
            <DetailsPanel
              selectedJob={selectedJob}
              currentRepo={currentRepo}
              revision={revision}
            />
          </Row>
        )}
      </Row>
    );
  }
}

TestFailure.propTypes = {
  failure: PropTypes.shape({
    testName: PropTypes.string.isRequired,
    jobName: PropTypes.string.isRequired,
    jobSymbol: PropTypes.string.isRequired,
    failJobs: PropTypes.arrayOf(PropTypes.shape({})),
    passJobs: PropTypes.arrayOf(PropTypes.shape({})),
    logLines: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    confidence: PropTypes.number.isRequired,
    platform: PropTypes.string.isRequired,
    config: PropTypes.string.isRequired,
    suggestedClassification: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
  }).isRequired,
  currentRepo: PropTypes.shape({}).isRequired,
  revision: PropTypes.string.isRequired,
  notify: PropTypes.func.isRequired,
  groupedBy: PropTypes.string.isRequired,
};

export default TestFailure;

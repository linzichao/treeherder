import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import FailureSummaryTab from '../../shared/tabs/failureSummary/FailureSummaryTab';
import LogTab from '../../shared/tabs/LogTab';
import { getJobsUrl, getLogViewerUrl } from '../../helpers/url';
import { getTaskRunStr } from '../../helpers/job';

class TaskTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
    };
  }

  setTabIndex = (tabIndex) => {
    this.setState({ tabIndex });
  };

  render() {
    const { jobDetails, selectedJobFull, currentRepo, revision } = this.props;
    const { tabIndex } = this.state;
    const logViewerFullUrl = getLogViewerUrl(
      selectedJobFull.id,
      currentRepo.name,
    );

    return (
      <div id="tabs-panel" role="region" aria-label="Job" className="d-flex">
        <Tabs
          selectedIndex={tabIndex}
          onSelect={this.setTabIndex}
          className="w-100 h-100"
        >
          <TabList>
            <Tab>Failure Summary</Tab>
            <Tab>Log</Tab>
            <Tab>Artifacts</Tab>
            <span className="tab-buttons mt-1">
              <a
                className="p-1 mx-2 text-darker-secondary border-1 rounded"
                href={getJobsUrl({
                  selectedTaskRun: getTaskRunStr(selectedJobFull),
                  repo: currentRepo.name,
                  revision,
                })}
                target="_blank"
                rel="noopener noreferrer"
                title="Open this task in Treeherder"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                View in Treeherder
              </a>
            </span>
          </TabList>
          <div className="w-100 tab-content">
            <TabPanel>
              <FailureSummaryTab
                selectedJob={selectedJobFull}
                jobLogUrls={selectedJobFull.logs}
                logParseStatus="unknown"
                logViewerFullUrl={logViewerFullUrl}
                className="bg-light"
              />
            </TabPanel>
            <TabPanel>
              <LogTab
                selectedJobFull={selectedJobFull}
                repoName={currentRepo.name}
              />
            </TabPanel>
            <TabPanel>
              <Col className="ml-2">
                {jobDetails.map((artifact) => (
                  <Row key={artifact.value}>
                    <a href={artifact.url}>{artifact.value}</a>
                  </Row>
                ))}
              </Col>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    );
  }
}

TaskTabs.propTypes = {
  jobDetails: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedJobFull: PropTypes.shape({}).isRequired,
  currentRepo: PropTypes.shape({}).isRequired,
  revision: PropTypes.string.isRequired,
};

export default TaskTabs;

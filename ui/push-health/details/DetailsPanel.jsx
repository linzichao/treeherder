import React from 'react';
import PropTypes from 'prop-types';

import { addAggregateFields } from '../../helpers/job';
import { getArtifactsUrl } from '../../helpers/url';
import { formatArtifacts } from '../../helpers/display';
import { getData } from '../../helpers/http';
import JobModel from '../../models/job';

import TaskTabs from './TaskTabs';

class DetailsPanel extends React.Component {
  constructor(props) {
    super(props);

    // used to cancel all the ajax requests triggered by selectJob
    this.selectJobController = null;

    this.state = {
      selectedJobFull: null,
      jobDetails: [],
      jobDetailLoading: false,
    };
  }

  componentDidMount() {
    const { selectedJob } = this.props;

    if (selectedJob) {
      this.selectJob(selectedJob);
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedJob } = this.props;

    if (selectedJob && prevProps.selectedJob) {
      const {
        id: prevId,
        state: prevState,
        result: prevResult,
        failure_classification_id: prevFci,
      } = prevProps.selectedJob;
      const { id, state, result, failure_classification_id: fci } = selectedJob;

      // Check the id in case the user switched to a new job.
      // But also check some of the fields of the selected job,
      // in case they have changed due to polling.
      if (
        prevId !== id ||
        prevState !== state ||
        prevResult !== result ||
        prevFci !== fci
      ) {
        this.selectJob();
      }
    } else if (selectedJob && selectedJob !== prevProps.selectedJob) {
      this.selectJob();
    }
  }

  findPush = (pushId) => {
    const { pushList } = this.props;

    return pushList.find((push) => pushId === push.id);
  };

  selectJob = async () => {
    const { currentRepo, selectedJob } = this.props;

    this.setState({ jobDetails: [], jobDetailLoading: true }, () => {
      if (this.selectJobController !== null) {
        // Cancel the in-progress fetch requests.
        this.selectJobController.abort();
      }

      this.selectJobController = new AbortController();

      const jobPromise = JobModel.get(
        currentRepo.name,
        selectedJob.id,
        this.selectJobController.signal,
      );

      const artifactsParams = {
        jobId: selectedJob.id,
        taskId: selectedJob.task_id,
        run: selectedJob.run_id,
        rootUrl: currentRepo.tc_root_url,
      };

      const jobArtifactsPromise = getData(
        getArtifactsUrl(artifactsParams),
        this.selectJobController.signal,
      );
      let builtFromArtifactPromise;

      if (
        currentRepo.name === 'comm-central' ||
        currentRepo.name === 'try-comm-central'
      ) {
        builtFromArtifactPromise = getData(
          getArtifactsUrl({
            ...artifactsParams,
            ...{ artifactPath: 'public/build/built_from.json' },
          }),
        );
      }

      // const jobLogUrlPromise = JobLogUrlModel.getList(
      //   { job_id: selectedJob.id },
      //   this.selectJobController.signal,
      // );

      Promise.all([jobPromise, jobArtifactsPromise, builtFromArtifactPromise])
        .then(
          async ([jobResult, jobArtifactsResult, builtFromArtifactResult]) => {
            // This version of the job has more information than what we get in the main job list.  This
            // is what we'll pass to the rest of the details panel.
            // Don't update the job instance in the greater job field so as to not add the memory overhead
            // of all the extra fields in ``selectedJobFull``.  It's not that much for just one job, but as
            // one selects job after job, over the course of a day, it can add up.  Therefore, we keep
            // selectedJobFull data as transient only when the job is selected.
            const selectedJobFull = jobResult;

            addAggregateFields(selectedJobFull);

            let jobDetails = jobArtifactsResult.data.artifacts
              ? formatArtifacts(jobArtifactsResult.data.artifacts, {
                  ...artifactsParams,
                })
              : [];

            if (
              builtFromArtifactResult &&
              !builtFromArtifactResult.failureStatus
            ) {
              jobDetails = [...jobDetails, ...builtFromArtifactResult.data];
            }

            this.setState({
              selectedJobFull,
              jobDetails,
            });
          },
        )
        .finally(() => {
          this.selectJobController = null;
        });
    });
  };

  render() {
    const { currentRepo, revision } = this.props;
    const { selectedJobFull, jobDetails, jobDetailLoading } = this.state;

    return (
      <div id="details-panel" className="w-100">
        {!!selectedJobFull && !!jobDetailLoading && (
          <div id="details-panel-content">
            <TaskTabs
              jobDetails={jobDetails}
              selectedJobFull={selectedJobFull}
              currentRepo={currentRepo}
              revision={revision}
            />
          </div>
        )}
      </div>
    );
  }
}

DetailsPanel.propTypes = {
  currentRepo: PropTypes.shape({}).isRequired,
  revision: PropTypes.string.isRequired,
  selectedJob: PropTypes.shape({}),
};

DetailsPanel.defaultProps = {
  selectedJob: null,
};

export default DetailsPanel;

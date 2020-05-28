import React from 'react';
import { render } from 'react-dom';

// Treeherder Styles
import '../css/treeherder-custom-styles.css';
import '../css/treeherder-navbar.css';
import '../css/treeherder-job-buttons.css';
import '../css/failure-summary.css';
import '../css/treeherder-notifications.css';
import './pushhealth.css';
import 'react-tabs/style/react-tabs.css';
import 'rc-switch/assets/index.css';
import App from './App';

render(<App />, document.getElementById('root'));

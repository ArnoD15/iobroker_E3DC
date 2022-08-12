---
name: Bug report
about: Create a report to help us improve
title: 'Charge-Control: '
labels: ''
assignees: ''

---

body:
- type: textarea
  attributes:
  label: The problem
  description: >-
        Describe the issue you are experiencing here. Tell us what you were trying to do
        step by step, and what happened that you did not expect.

        Provide a clear and concise description of what the problem is and include as many
        details as possible.
   validations:
   required: true

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots & Logfiles**
If applicable, add screenshots and ioBroker LOG Files to help explain your problem.

**Versions:**  
 - Adapter version: <adapter-version>
 - JS-Controller version: <js-controller-version> <!-- determine this with `iobroker -v` on the console -->
 - Node version: <node-version> <!-- determine this with `node -v` on the console -->
 - Operating system: <os-name>

**Additional context**
Add any other context about the problem here.

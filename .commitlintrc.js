// https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md
// https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [1, 'always', 50],
    'body-max-line-length': [1, 'always', 72],
    'body-case': [2, 'always', 'sentence-case'],
    'footer-max-line-length': [1, 'always', 72],
  },
};

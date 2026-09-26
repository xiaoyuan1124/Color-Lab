module.exports = {
  ci: {
    collect: {
      staticDistDir: '.',
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        chromeFlags: '--no-sandbox --headless=new'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci-reports'
    }
  }
};

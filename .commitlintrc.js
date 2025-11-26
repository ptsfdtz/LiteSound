module.exports = {
  extends: ['@commitlint/config-conventional'], // 使用 conventional commit 规范
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式（不影响功能）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'chore', // 构建/工具更新
      ],
    ],
    'subject-case': [0, 'never', ['start-case', 'pascal-case', 'upper-case']], // 可选，允许任意大小写
  },
};

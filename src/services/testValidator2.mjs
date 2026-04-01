// 验证测试用例的完整性
function validateTestStories() {
  console.log('=== 验证测试用例 ===')

  // 模拟测试数据（从stories.test.ts中提取）
  const testStories = [
    {
      id: 'test-audience-clap',
      title: '测试：观众拍手掌',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-hand',
      title: '测试：观众有手吗',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-palm',
      title: '测试：观众拍的是手掌吗',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-not-clap',
      title: '测试：观众没有拍手',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-real-clap',
      title: '测试：真实掌声',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众确实有手，他们用双手鼓掌表示赞赏，发出真实的掌声。'
    },
    {
      id: 'test-audience-table',
      title: '测试：拍桌子',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，他们在拍打座椅和扶手，制造出掌声的效果。'
    },
    {
      id: 'test-audience-monkey',
      title: '测试：猴子观众',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众是猴子，它们没有手，只是在拍打自己的身体，制造出掌声的效果。'
    },
    {
      id: 'test-audience-prosthetic',
      title: '测试：假肢观众',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众有假肢，他们用假肢拍手，发出掌声。'
    },
    {
      id: 'test-audience-recording',
      title: '测试：录音掌声',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '现场播放的是预先录制的掌声录音，制造出掌声的效果，发出掌声。'
    },
    {
      id: 'test-audience-confusion',
      title: '测试：掌声混淆',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，现场响的是预录掌声，但演员误以为是真实的掌声。'
    },
    {
      id: 'test-audience-detail',
      title: '测试：掌声细节',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，他们用金属工具敲击座椅，制造出类似掌声的声音。'
    },
    {
      id: 'test-audience-reason',
      title: '测试：掌声原因',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，掌声是信号，用来通知同伙行动。'
    },
    {
      id: 'test-audience-variation',
      title: '测试：掌声变体',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，掌声是多种声音的混合：预录掌声、座椅敲击声、金属摩擦声。'
    },
    {
      id: 'test-audience-misdirection',
      title: '测试：掌声误导',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，掌声是用来分散注意力的，真正的行动在后台进行。'
    },
    {
      id: 'test-audience-history',
      title: '测试：掌声历史',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，掌声是传统，源于古代没有手的观众用脚跺地表示赞赏。'
    },
    {
      id: 'test-audience-psychology',
      title: '测试：掌声心理学',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，掌声是集体无意识行为，每个人都在模仿他人的动作。'
    }
  ]

  const commonTestStories = [
    {
      id: 'test-hand-questions',
      title: '测试：手部相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-palm-questions',
      title: '测试：手掌相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-fingers-questions',
      title: '测试：手指相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-wrist-questions',
      title: '测试：手腕相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-clap-questions',
      title: '测试：拍手相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-slap-questions',
      title: '测试：拍打相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-tap-questions',
      title: '测试：轻拍相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-beat-questions',
      title: '测试：敲击相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-people',
      title: '测试：观众相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-crowd',
      title: '测试：人群相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-spectators',
      title: '测试：观众席相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-audience-members',
      title: '测试：成员相关问题',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-complex-questions-1',
      title: '测试：复杂问题1',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-complex-questions-2',
      title: '测试：复杂问题2',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-complex-questions-3',
      title: '测试：复杂问题3',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-complex-questions-4',
      title: '测试：复杂问题4',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-edge-case-1',
      title: '测试：边界情况1',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-edge-case-2',
      title: '测试：边界情况2',
      difficulty: 'easy',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-edge-case-3',
      title: '测试：边界情况3',
      difficulty: 'medium',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      id: 'test-edge-case-4',
      title: '测试：边界情况4',
      difficulty: 'hard',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    }
  ]

  // 验证测试用例数量
  console.log(`测试用例总数: ${testStories.length + commonTestStories.length}`)

  // 验证每个测试用例
  const allStories = [...testStories, ...commonTestStories]

  allStories.forEach((story, index) => {
    const isValid = validateStory(story)
    console.log(`[${index + 1}/${allStories.length}] ${story.title}: ${isValid ? '✅ 有效' : '❌ 无效'}`)

    if (!isValid) {
      console.log(`  问题: ${story.surface}`)
      console.log(`  答案: ${story.bottom}`)
    }
  })

  // 统计结果
  const validCount = allStories.filter(story => validateStory(story)).length
  const invalidCount = allStories.length - validCount

  console.log(`\n=== 验证结果 ===`)
  console.log(`有效测试用例: ${validCount}`)
  console.log(`无效测试用例: ${invalidCount}`)
  console.log(`总通过率: ${((validCount / allStories.length) * 100).toFixed(1)}%`)
}

// 验证单个故事
function validateStory(story) {
  // 检查必需字段
  if (!story.id || !story.title || !story.difficulty || !story.surface || !story.bottom) {
    return false
  }

  // 检查字段类型
  if (typeof story.id !== 'string' ||
      typeof story.title !== 'string' ||
      typeof story.difficulty !== 'string' ||
      typeof story.surface !== 'string' ||
      typeof story.bottom !== 'string') {
    return false
  }

  // 检查故事逻辑
  const surface = story.surface.toLowerCase()
  const bottom = story.bottom.toLowerCase()

  // 检查汤面和汤底的一致性
  if (surface.includes('掌声') && !bottom.includes('掌声')) {
    return false
  }

  if (surface.includes('观众') && !bottom.includes('观众')) {
    return false
  }

  if (surface.includes('手') && !bottom.includes('手')) {
    return false
  }

  if (surface.includes('拍') && !bottom.includes('拍')) {
    return false
  }

  // 检查汤底是否提供了明确的答案
  if (story.bottom.includes('没有手') || story.bottom.includes('没有拍') || story.bottom.includes('预录掌声')) {
    return true
  }

  if (story.bottom.includes('有手') || story.bottom.includes('鼓掌') || story.bottom.includes('拍手')) {
    return true
  }

  return false
}

// 运行验证
validateTestStories()